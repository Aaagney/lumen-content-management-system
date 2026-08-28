import type { Quiz } from './types';

export const sampleQuiz: Quiz = {
  id: 'ai-fundamentals',
  articleId: 'intro-to-ai',
  title: 'Test Your Knowledge: Introduction to Artificial Intelligence',
  description:
    'Check your understanding of core AI concepts from the article, including machine learning, neural networks, and real-world applications.',
  estimatedTime: 5,
  questions: [
    {
      id: 'q1',
      question: 'What is Machine Learning?',
      options: [
        { id: 'A', text: 'A programming language designed for robots' },
        { id: 'B', text: 'A system that learns patterns from data' },
        { id: 'C', text: 'A type of relational database' },
        { id: 'D', text: 'A computer hardware system for graphics' },
      ],
      correctAnswer: 'B',
      explanation:
        'Machine learning is a method in which systems learn patterns from data and improve their performance without being explicitly programmed.',
    },
    {
      id: 'q2',
      question: 'Which of the following is a type of supervised learning?',
      options: [
        { id: 'A', text: 'Clustering customers into segments' },
        { id: 'B', text: 'Predicting house prices from labeled sales data' },
        { id: 'C', text: 'Reducing the dimensions of a dataset' },
        { id: 'D', text: 'Discovering association rules in transactions' },
      ],
      correctAnswer: 'B',
      explanation:
        'Supervised learning uses labeled data to train a model to predict outcomes, such as house prices from historical sales records.',
    },
    {
      id: 'q3',
      question: 'What does a neural network loosely model?',
      options: [
        { id: 'A', text: 'The structure of the human brain' },
        { id: 'B', text: 'The layout of a printed circuit board' },
        { id: 'C', text: 'The routing tables in a network switch' },
        { id: 'D', text: 'The file system of an operating system' },
      ],
      correctAnswer: 'A',
      explanation:
        'Neural networks are inspired by the neurons in the human brain, using interconnected nodes that pass signals to learn complex patterns.',
    },
    {
      id: 'q4',
      question: 'Which problem is best suited for reinforcement learning?',
      options: [
        { id: 'A', text: 'Classifying emails as spam or not spam' },
        { id: 'B', text: 'Grouping similar news articles together' },
        { id: 'C', text: 'Training a robot to walk through trial and error' },
        { id: 'D', text: 'Translating a fixed sentence from English to French' },
      ],
      correctAnswer: 'C',
      explanation:
        'Reinforcement learning trains an agent to make a sequence of decisions by rewarding desired actions, making it ideal for tasks like robot locomotion.',
    },
    {
      id: 'q5',
      question: 'What is the purpose of a loss function in training a model?',
      options: [
        { id: 'A', text: 'To speed up data loading from disk' },
        { id: 'B', text: 'To measure how far predictions are from the true values' },
        { id: 'C', text: 'To encrypt sensitive training data' },
        { id: 'D', text: 'To compress the trained model for deployment' },
      ],
      correctAnswer: 'B',
      explanation:
        'A loss function quantifies the difference between the model predictions and the actual target values, guiding the optimizer during training.',
    },
    {
      id: 'q6',
      question: 'What does "overfitting" mean in machine learning?',
      options: [
        { id: 'A', text: 'The model performs well on new data but poorly on training data' },
        { id: 'B', text: 'The model memorizes training data and generalizes poorly' },
        { id: 'C', text: 'The model trains too quickly and ignores features' },
        { id: 'D', text: 'The dataset contains too many features for one model' },
      ],
      correctAnswer: 'B',
      explanation:
        'Overfitting occurs when a model learns the training data, including its noise, so closely that it fails to generalize to unseen data.',
    },
    {
      id: 'q7',
      question: 'Which technique helps reduce overfitting?',
      options: [
        { id: 'A', text: 'Removing all regularization terms' },
        { id: 'B', text: 'Using a more complex model architecture' },
        { id: 'C', text: 'Applying dropout in a neural network' },
        { id: 'D', text: 'Training for as many epochs as possible' },
      ],
      correctAnswer: 'C',
      explanation:
        'Dropout randomly disables neurons during training, which prevents the network from relying too heavily on any single path and reduces overfitting.',
    },
    {
      id: 'q8',
      question: 'What is natural language processing (NLP) primarily concerned with?',
      options: [
        { id: 'A', text: 'Rendering 3D graphics on screen' },
        { id: 'B', text: 'Interaction between computers and human language' },
        { id: 'C', text: 'Optimizing database query performance' },
        { id: 'D', text: 'Managing network packet routing' },
      ],
      correctAnswer: 'B',
      explanation:
        'NLP is a field of AI focused on enabling computers to understand, interpret, and generate human language in a meaningful way.',
    },
    {
      id: 'q9',
      question: 'Which of the following is an example of computer vision?',
      options: [
        { id: 'A', text: 'Translating a paragraph from Spanish to English' },
        { id: 'B', text: 'Detecting objects in an image' },
        { id: 'C', text: 'Recommending products based on purchase history' },
        { id: 'D', text: 'Forecasting tomorrow\'s temperature' },
      ],
      correctAnswer: 'B',
      explanation:
        'Computer vision involves analyzing and understanding visual information from the world, such as identifying objects within images or video frames.',
    },
    {
      id: 'q10',
      question: 'What is a common ethical concern with AI systems?',
      options: [
        { id: 'A', text: 'The color palette used in the user interface' },
        { id: 'B', text: 'Bias in training data leading to unfair outcomes' },
        { id: 'C', text: 'The number of comments in source code' },
        { id: 'D', text: 'The choice of code editor used by developers' },
      ],
      correctAnswer: 'B',
      explanation:
        'AI systems can inherit and amplify biases present in their training data, resulting in unfair or discriminatory decisions, which is a major ethical concern.',
    },
  ],
};
