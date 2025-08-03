import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Post from './models/Post.js';

dotenv.config();

const setupDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create sample users
    const users = await User.create([
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        title: 'Senior Software Engineer',
        company: 'TechCorp',
        location: 'San Francisco, CA',
        bio: 'Passionate about web development and open source',
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        interests: ['Web Development', 'AI', 'Open Source']
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah@example.com',
        password: 'password123',
        title: 'Product Manager',
        company: 'InnovateCo',
        location: 'New York, NY',
        bio: 'Building products that make a difference',
        skills: ['Product Management', 'User Research', 'Agile', 'Data Analysis'],
        interests: ['Product Strategy', 'User Experience', 'Startups']
      },
      {
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael@example.com',
        password: 'password123',
        title: 'UX Designer',
        company: 'DesignStudio',
        location: 'Los Angeles, CA',
        bio: 'Creating beautiful and functional user experiences',
        skills: ['UI/UX Design', 'Figma', 'Prototyping', 'User Research'],
        interests: ['Design Systems', 'Accessibility', 'Creative Technology']
      },
      {
        firstName: 'Emily',
        lastName: 'Rodriguez',
        email: 'emily@example.com',
        password: 'password123',
        title: 'Data Scientist',
        company: 'DataCorp',
        location: 'Austin, TX',
        bio: 'Turning data into insights and stories',
        skills: ['Python', 'Machine Learning', 'SQL', 'Data Visualization'],
        interests: ['AI/ML', 'Data Science', 'Analytics']
      }
    ]);

    console.log('👥 Created sample users');

    // Create sample posts
    const posts = await Post.create([
      {
        author: users[0]._id,
        content: 'Just shipped a new feature that reduces page load time by 40%! Excited to see the impact on user experience. The key was implementing lazy loading and optimizing our bundle size. #webdev #performance',
        hashtags: ['webdev', 'performance'],
        visibility: 'public'
      },
      {
        author: users[1]._id,
        content: 'Reflecting on an amazing quarter! Our team launched 3 major features and increased user engagement by 25%. Couldn\'t have done it without this incredible team. What\'s your biggest win this quarter?',
        hashtags: ['product', 'teamwork', 'growth'],
        visibility: 'public'
      },
      {
        author: users[2]._id,
        content: 'Design tip: Always test your prototypes with real users before finalizing. What seems intuitive to us might not be intuitive to our users. User research is invaluable! 🎨',
        hashtags: ['design', 'ux', 'usability'],
        visibility: 'public'
      },
      {
        author: users[3]._id,
        content: 'Bootstrapping a startup teaches you to be resourceful. Every dollar counts, every decision matters. But the journey is incredibly rewarding when you see your vision come to life! 🚀',
        hashtags: ['startup', 'entrepreneurship', 'growth'],
        visibility: 'public'
      }
    ]);

    console.log('📝 Created sample posts');

    // Add some connections between users
    users[0].connections.push(users[1]._id, users[2]._id);
    users[1].connections.push(users[0]._id, users[3]._id);
    users[2].connections.push(users[0]._id, users[3]._id);
    users[3].connections.push(users[1]._id, users[2]._id);

    // Add some followers
    users[0].followers.push(users[1]._id, users[2]._id, users[3]._id);
    users[1].followers.push(users[0]._id, users[2]._id);
    users[2].followers.push(users[0]._id, users[1]._id, users[3]._id);
    users[3].followers.push(users[0]._id, users[1]._id);

    // Update users
    await Promise.all(users.map(user => user.save()));

    console.log('🔗 Created sample connections and followers');

    // Add some likes to posts
    posts[0].likes.push({ user: users[1]._id }, { user: users[2]._id });
    posts[1].likes.push({ user: users[0]._id }, { user: users[2]._id }, { user: users[3]._id });
    posts[2].likes.push({ user: users[0]._id }, { user: users[1]._id });
    posts[3].likes.push({ user: users[0]._id }, { user: users[1]._id }, { user: users[2]._id });

    // Add some comments
    posts[0].comments.push({
      user: users[1]._id,
      content: 'Great work! Performance improvements are always exciting to see.'
    });
    posts[1].comments.push({
      user: users[0]._id,
      content: 'Congratulations! That\'s an impressive achievement.'
    });
    posts[2].comments.push({
      user: users[3]._id,
      content: 'So true! User research is the foundation of good design.'
    });

    // Update posts
    await Promise.all(posts.map(post => post.save()));

    console.log('👍 Created sample likes and comments');

    console.log('\n✅ Database setup completed successfully!');
    console.log('\n📊 Sample Data:');
    console.log(`- Users: ${users.length}`);
    console.log(`- Posts: ${posts.length}`);
    console.log('- Connections and followers created');
    console.log('- Sample likes and comments added');
    
    console.log('\n🔑 Sample Login Credentials:');
    users.forEach(user => {
      console.log(`- ${user.email} / password123`);
    });

    console.log('\n🚀 You can now start the server with: npm run dev');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

setupDatabase(); 