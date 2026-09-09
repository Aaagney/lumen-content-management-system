const db = require('../config/db');

const getQuiz = async (req, res) => {
  try {
    const [quizzes] = await db.execute(
      `SELECT q.*, a.title AS article_title, a.author_id, a.status AS article_status
       FROM quizzes q JOIN articles a ON q.article_id = a.id WHERE q.id = ?`,
      [req.params.id]
    );
    if (!quizzes.length) return res.status(404).json({ message: 'Quiz not found' });
    const quiz = quizzes[0];
    if (quiz.article_status !== 'Published' && (!req.user || (req.user.id !== quiz.author_id && req.user.role !== 'admin'))) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    const [questions] = await db.execute(
      `SELECT id, question, explanation, question_order FROM quiz_questions WHERE quiz_id = ? ORDER BY question_order, id`, [quiz.id]
    );
    const ids = questions.map(q => q.id);
    let options = [];
    if (ids.length) {
      const placeholders = ids.map(() => '?').join(',');
      const [rows] = await db.execute(`SELECT id, question_id, option_text, option_order FROM quiz_options WHERE question_id IN (${placeholders}) ORDER BY option_order, id`, ids);
      options = rows;
    }
    res.json({ ...quiz, questions: questions.map(q => ({ ...q, options: options.filter(o => o.question_id === q.id) })) });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Internal server error' }); }
};

const listForArticle = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT q.id, q.article_id, q.title, q.description, q.estimated_time, q.created_at
       FROM quizzes q JOIN articles a ON q.article_id = a.id
       WHERE q.article_id = ? AND a.status = 'Published'`, [req.params.articleId]
    );
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ message: 'Internal server error' }); }
};

const saveQuiz = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { article_id, title, description, estimated_time, questions } = req.body;
    if (!article_id || !title || !Array.isArray(questions) || !questions.length) return res.status(400).json({ message: 'article_id, title and questions are required' });
    const [articles] = await conn.execute('SELECT id, author_id FROM articles WHERE id = ?', [article_id]);
    if (!articles.length) return res.status(404).json({ message: 'Article not found' });
    if (req.user.role !== 'admin' && Number(articles[0].author_id) !== Number(req.user.id)) return res.status(403).json({ message: 'You can only manage quizzes for your own articles' });
    await conn.beginTransaction();
    const [existing] = await conn.execute('SELECT id FROM quizzes WHERE article_id = ?', [article_id]);
    let quizId;
    if (existing.length) {
      quizId = existing[0].id;
      await conn.execute('UPDATE quizzes SET title=?, description=?, estimated_time=? WHERE id=?', [title, description || null, Number(estimated_time) || 5, quizId]);
      await conn.execute('DELETE FROM quiz_questions WHERE quiz_id=?', [quizId]);
    } else {
      const [r] = await conn.execute('INSERT INTO quizzes (article_id,title,description,estimated_time,created_by) VALUES (?,?,?,?,?)', [article_id,title,description||null,Number(estimated_time)||5,req.user.id]);
      quizId = r.insertId;
    }
    for (let qi=0; qi<questions.length; qi++) {
      const q=questions[qi];
      const opts=Array.isArray(q.options)?q.options:[];
      if (!q.question || opts.length < 2 || !opts.some(o=>o.is_correct)) throw new Error('Each question needs at least two options and one correct option');
      const [qr]=await conn.execute('INSERT INTO quiz_questions (quiz_id,question,explanation,question_order) VALUES (?,?,?,?)',[quizId,q.question,q.explanation||null,qi]);
      for (let oi=0; oi<opts.length; oi++) await conn.execute('INSERT INTO quiz_options (question_id,option_text,is_correct,option_order) VALUES (?,?,?,?)',[qr.insertId,opts[oi].option_text,!!opts[oi].is_correct,oi]);
    }
    await conn.commit(); res.status(existing.length ? 200 : 201).json({ id: quizId, message:'Quiz saved successfully' });
  } catch(e) { await conn.rollback(); console.error(e); res.status(400).json({ message: e.message || 'Could not save quiz' }); }
  finally { conn.release(); }
};

const submitAttempt = async (req,res) => {
  const conn=await db.getConnection();
  try {
    const answers=Array.isArray(req.body.answers)?req.body.answers:[];
    const [quizzes]=await conn.execute('SELECT q.id,a.status FROM quizzes q JOIN articles a ON q.article_id=a.id WHERE q.id=?',[req.params.id]);
    if(!quizzes.length || quizzes[0].status!=='Published') return res.status(404).json({message:'Quiz not found'});
    const [questions]=await conn.execute('SELECT id FROM quiz_questions WHERE quiz_id=? ORDER BY question_order,id',[req.params.id]);
    if(!questions.length) return res.status(400).json({message:'Quiz has no questions'});
    const ids=questions.map(q=>q.id), ph=ids.map(()=>'?').join(',');
    const [options]=await conn.execute(`SELECT id,question_id,is_correct,option_text FROM quiz_options WHERE question_id IN (${ph})`,ids);
    let score=0; const resultAnswers=[];
    for(const q of questions){ const submitted=answers.find(a=>Number(a.question_id)===Number(q.id)); const selected=submitted?Number(submitted.selected_option_id):null; const opt=options.find(o=>Number(o.id)===selected && Number(o.question_id)===Number(q.id)); const correct=!!opt?.is_correct; if(correct) score++; resultAnswers.push({question_id:q.id,selected_option_id:selected,correct}); }
    await conn.beginTransaction();
    const percentage=Number(((score/questions.length)*100).toFixed(2));
    const [ar]=await conn.execute('INSERT INTO quiz_attempts (quiz_id,user_id,score,total_questions,percentage) VALUES (?,?,?,?,?)',[req.params.id,req.user.id,score,questions.length,percentage]);
    for(const a of resultAnswers) await conn.execute('INSERT INTO quiz_attempt_answers (attempt_id,question_id,selected_option_id,correct) VALUES (?,?,?,?)',[ar.insertId,a.question_id,a.selected_option_id,a.correct]);
    await conn.commit();
    res.status(201).json({ attempt_id:ar.insertId, score, total_questions:questions.length, percentage, answers:resultAnswers });
  } catch(e){await conn.rollback();console.error(e);res.status(500).json({message:'Could not submit quiz'});} finally{conn.release();}
};

const getAttempt = async(req,res)=>{try{const [rows]=await db.execute(`SELECT * FROM quiz_attempts WHERE id=? AND user_id=?`,[req.params.attemptId,req.user.id]);if(!rows.length)return res.status(404).json({message:'Result not found'});const [answers]=await db.execute(`SELECT aa.*, qq.question, qq.explanation, qo.option_text AS selected_option_text FROM quiz_attempt_answers aa JOIN quiz_questions qq ON aa.question_id=qq.id LEFT JOIN quiz_options qo ON aa.selected_option_id=qo.id WHERE aa.attempt_id=? ORDER BY qq.question_order,qq.id`,[req.params.attemptId]);res.json({...rows[0],answers});}catch(e){console.error(e);res.status(500).json({message:'Internal server error'});}};

const myAttempts=async(req,res)=>{try{const [rows]=await db.execute(`SELECT qa.*,q.title FROM quiz_attempts qa JOIN quizzes q ON qa.quiz_id=q.id WHERE qa.user_id=? ORDER BY qa.created_at DESC`,[req.user.id]);res.json(rows);}catch(e){res.status(500).json({message:'Internal server error'});}};
module.exports={getQuiz,listForArticle,saveQuiz,submitAttempt,getAttempt,myAttempts};
