CREATE DATABASE IF NOT EXISTS cms_db;
USE cms_db;

DROP TABLE IF EXISTS articles;

CREATE TABLE articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  author VARCHAR(100) NOT NULL,
  author_description TEXT,
  image VARCHAR(255),
  reading_time VARCHAR(20) NOT NULL,
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  published_date VARCHAR(50) NOT NULL,
  tags VARCHAR(255)
);

INSERT INTO articles (title, description, content, category, author, author_description, image, reading_time, views, likes, published_date, tags) VALUES
(
  'How CRISPR Is Rewriting the Story of Human Disease',
  'A quiet revolution in molecular biology has produced a tool precise enough to correct a single letter in the three-billion-character book of human DNA.',
  'The laboratory is a place of carefully managed uncertainty. For Priya Mehta, a morning at the bench begins not with pipettes and PCR machines, but with a kind of reckoning — with what might work, what might fail, and what could change everything.\n\nCRISPR-Cas9, the gene-editing system that has dominated biology headlines since 2012, is now moving from bench to bedside with a speed that startles even its pioneers. In late 2023, the FDA approved the first CRISPR-based therapy for sickle cell disease, marking a turning point that many researchers thought was still a decade away.\n\n### What CRISPR Actually Does\n\nAt its core, CRISPR is a bacterial immune system repurposed as a molecular scalpel. Bacteria use it to recognize and cut viral DNA — a kind of biological memory. Scientists learned to program the system with a guide RNA, directing the Cas9 protein to any target sequence in a genome with remarkable specificity.\n\nThe repair mechanisms cells then activate can disable a gene, correct a mutation, or insert new genetic material. The possibilities are constrained mainly by what we understand about disease — which is to say, they are constrained, but not for much longer.\n\n### The Road to the Clinic\n\nThe application of CRISPR to patient care represents a milestone in clinical translation. Rather than treating symptoms, gene editing target-corrects the underlying genetic defect. For sickle cell disease, this means correcting the mutation in hemoglobin genes or activating fetal hemoglobin to compensate for it. The therapy is now achievable with durable results in clinical trials. Patients who received the therapy have remained free of the debilitating pain crises that once defined their lives.\n\nThe story does not end there. Trials are underway for Duchenne muscular dystrophy, several forms of hereditary blindness, and certain cancers. The pace is accelerating.\n\n### The Ethical Terrain\n\nThe technology\'s promise does not arrive without weight. Germline editing — modifying embryos so that changes pass to future generations — remains deeply controversial and is effectively banned in most jurisdictions. The 2018 birth of CRISPR-edited babies in China, announced by He Jiankui, produced a global condemnation that has shaped regulatory conversations ever since.\n\nWhere somatic editing treats one person, germline editing would alter a lineage. The distinction matters enormously, and the scientific community\'s consensus is clear: the tools are not yet safe or precise enough for heritable modification, and the ethical frameworks for such decisions do not yet exist.\n\n### What Comes Next\n\nBase editing and prime editing — successor technologies that operate without cutting the double helix entirely — promise even greater precision with fewer unintended consequences. They are arriving in clinical trials as CRISPR\'s first wave of therapies matures.\n\nThe story of molecular medicine is being rewritten not in metaphor but in sequence. Nucleotide by nucleotide, the boundary between diagnosis and cure is moving.',
  'Science',
  'Priya Mehta',
  'Science communicator and molecular biologist. Writing about the invisible world.',
  'images/crispr.png',
  '7 min read',
  4821,
  284,
  'July 16, 2026',
  'biology,medicine,genetics'
),
(
  'The Night the Internet Was Born — and Almost Wasn\'t',
  'On October 29, 1969, a student typed two letters into a terminal at UCLA. The system crashed. The internet had begun.',
  'The laboratory at UCLA was quiet on the evening of October 29, 1969. Charley Kline, a student programmer, sat at an SDS Sigma 7 computer, preparing to send the first message to a computer at the Stanford Research Institute (SRI). Under the supervision of Professor Leonard Kleinrock, the plan was to type "LOGIN".\n\nKline typed the letter "L" and confirmed SRI received it. He typed the letter "O" and confirmed its receipt. Then, he typed "G", and the system crashed. The Stanford computer had run out of buffer memory.\n\n### The First Connection\n\nDespite the crash, the transmission of "LO" marked the birth of ARPANET, the precursor to the modern internet. It was a modest start, but the packet-switching architecture devised by Kleinrock and others proved remarkably robust. Within an hour, they got the system running again and successfully completed the full "LOGIN" command.\n\n### Packet Switching vs Circuit Switching\n\nUntil ARPANET, telecommunications relied on circuit switching—the method used by the telephone system, where a dedicated line is established for the duration of a call. Packet switching split data into small packets that routed independently through a network, utilizing bandwidth far more efficiently and surviving local node outages.\n\n### The Network Expands\n\nBy December 1969, ARPANET had four nodes: UCLA, Stanford, UC Santa Barbara, and the University of Utah. Today, the network encompasses billions of devices globally, tracing its ancestry directly to that late-night crash in Los Angeles.',
  'Technology',
  'Thomas Okeke',
  'Systems engineer and technology historian. Exploring the foundations of the digital age.',
  'images/internet.png',
  '6 min read',
  3104,
  198,
  'October 29, 2026',
  'internet,history,networking'
),
(
  'The Great Barrier Reef\'s Silent Struggle',
  'Rising ocean temperatures are driving unprecedented coral bleaching events, forcing marine scientists to develop new resilience strategies.',
  'Beneath the surface of the Coral Sea, a slow-motion ecological crisis is unfolding. The Great Barrier Reef, the world\'s largest living structure, is experiencing its fifth major bleaching event in eight years. The cause is clear: sustained sea surface temperatures that are 1.5 to 2.0 degrees Celsius above seasonal averages.\n\n### Coral and Symbiosis\n\nCorals get their vibrant colors and most of their energy from microscopic algae called zooxanthellae, which live inside their tissues. When water temperatures get too high, corals become stressed and expel these algae, leaving their white skeletons exposed. If temperatures drop quickly enough, corals can recover; if not, they starve.\n\n### Innovative Solutions\n\nMarine biologists are now trialing "assisted evolution," breeding heat-tolerant strains of coral in laboratories. Others are deploying shade fabrics over high-value reefs or using cloud brightening to reflect sunlight and lower local water temperatures. While these efforts offer local relief, scientists emphasize that global carbon reduction is the only long-term cure.',
  'Environment',
  'Amara Silva',
  'Environmental journalist and diver. Focused on conservation and marine ecosystems.',
  'images/reef.png',
  '5 min read',
  1205,
  98,
  'August 10, 2026',
  'environment,climate,ocean'
),
(
  'The Sleep Paradox: Why We Need Rest to Learn',
  'Neuroscientists are discovering that sleep is not a passive shutdown, but an active consolidation phase essential for memory formation.',
  'For decades, sleep was viewed simply as a period of recovery for the body. However, recent functional MRI studies reveal that during sleep, the brain is highly active, performing essential cognitive maintenance and memory consolidation.\n\n### Consolidating Memories\n\nDuring the day, new experiences are stored temporarily in the hippocampus. During deep sleep (slow-wave sleep), these memories are replayed and transferred to the neocortex for long-term storage. This process, known as synaptic consolidation, makes room for new learning the following day.\n\n### REM and Creativity\n\nDuring Rapid Eye Movement (REM) sleep, characterized by vivid dreaming, the brain integrates new memories with existing knowledge structures. This is where we form novel connections, explaining why "sleeping on a problem" often leads to creative solutions.',
  'Health',
  'Lena Kaufmann',
  'Health writer and clinical psychologist. Passionate about sleep science and mental wellness.',
  'images/sleep.png',
  '5 min read',
  2450,
  172,
  'May 12, 2026',
  'health,neuroscience,sleep'
),
(
  'Deciphering the Indus Valley Script: A 4,000-Year-Old Mystery',
  'Archaeologists and computer scientists are combining forces to unlock the secrets of an ancient civilization\'s undeciphered writing system.',
  'Between 2600 and 1900 BCE, the Indus Valley Civilization flourished, boasting planned cities, advanced sanitation, and global trade. Yet, unlike their contemporaries in Mesopotamia and Egypt, their writing system remains undeciphered. Over 400 unique symbols have been identified on small soapstone seals, but no bilingual text—like a Rosetta Stone—has ever been found.\n\n### The Decipherment Challenge\n\nWithout knowing the underlying language family or having a long inscription (most are just 4-5 symbols long), decipherment is a massive statistical challenge. Some scholars believe the language is Dravidian, while others propose Indo-Aryan origins.\n\n### Machine Learning to the Rescue\n\nRecently, researchers have used deep learning to analyze the sequence ordering of Indus symbols. By computing the entropy of the script, AI has shown it exhibits patterns similar to spoken languages, contradicting theories that the symbols are merely decorative or heraldic badges.',
  'History',
  'Priya Mehta',
  'Science communicator and molecular biologist. Writing about the invisible world.',
  'images/indus.png',
  '8 min read',
  1980,
  110,
  'April 5, 2026',
  'history,archaeology,ancient'
),
(
  'The Quantum Realm: Computing Beyond the Transistor',
  'Quantum computers promise to solve calculations in minutes that would take classical supercomputers millennia.',
  'As silicon transistors approach the physical limits of atomic scale, classical computer scaling is slowing down. Enter quantum computing, a technology based on the principles of quantum mechanics rather than classical binary state.\n\n### Superposition and Entanglement\n\nWhile classical computers use bits (0 or 1), quantum computers use qubits. Qubits can exist in a state of superposition—being both 0 and 1 simultaneously. When qubits are entangled, the state of one instantly influences another, allowing quantum computers to process massive combinations of variables in parallel.\n\n### Practical Applications\n\nQuantum computers are not general-purpose machines; they are accelerators for specific problems. Their primary applications lie in cryptanalysis, simulating complex chemical structures for drug discovery, and optimizing logistics routes. Tech giants are racing to build systems with enough error-corrected qubits to achieve commercial quantum advantage.',
  'Science',
  'Thomas Okeke',
  'Systems engineer and technology historian. Exploring the foundations of the digital age.',
  'images/quantum.png',
  '7 min read',
  2890,
  215,
  'June 20, 2026',
  'science,physics,computing'
);
