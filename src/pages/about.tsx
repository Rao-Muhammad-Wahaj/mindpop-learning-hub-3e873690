
import { motion } from "framer-motion";
import { Lightbulb, BookOpen, Award, Users, CheckCircle } from "lucide-react";

export default function AboutPage() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5 
      } 
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-white to-mindpop-100 dark:from-mindpop-600 dark:to-gray-900">
        <div className="mindpop-container">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              About <span className="text-mindpop-400 dark:text-mindpop-300">MindPop</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our mission is to make learning accessible, engaging, and effective 
              through technology-enabled education and personalized assessment.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="mindpop-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Our Story
              </h2>
              <div className="prose dark:prose-invert max-w-none">
                <p>
                  MindPop was founded in 2023 with a simple vision: to transform
                  the way people learn and assess knowledge. We recognized that
                  traditional education systems often struggle to provide
                  personalized learning experiences at scale.
                </p>
                <p>
                  Our platform was built to bridge this gap by combining interactive
                  course content with intelligent assessment tools. We believe that
                  effective learning happens when students receive immediate feedback
                  and can track their progress.
                </p>
                <p>
                  Today, MindPop serves thousands of students and educators
                  worldwide, providing a space where knowledge can be shared,
                  tested, and mastered in a supportive digital environment.
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="relative"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1742&q=80" 
                  alt="Students learning together" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16 bg-mindpop-100 dark:bg-gray-800">
        <div className="mindpop-container">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              The principles that guide everything we do at MindPop
            </p>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            <motion.div 
              variants={fadeInUp} 
              className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 text-center"
            >
              <div className="w-12 h-12 bg-mindpop-100 dark:bg-mindpop-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="h-6 w-6 text-mindpop-500 dark:text-mindpop-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Innovation
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We constantly explore new ways to enhance the learning experience through technology.
              </p>
            </motion.div>
            
            <motion.div 
              variants={fadeInUp} 
              className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 text-center"
            >
              <div className="w-12 h-12 bg-mindpop-100 dark:bg-mindpop-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-mindpop-500 dark:text-mindpop-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Accessibility
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We believe quality education should be available to everyone, everywhere.
              </p>
            </motion.div>
            
            <motion.div 
              variants={fadeInUp} 
              className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 text-center"
            >
              <div className="w-12 h-12 bg-mindpop-100 dark:bg-mindpop-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-mindpop-500 dark:text-mindpop-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Community
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We foster connections between learners and educators to create collaborative environments.
              </p>
            </motion.div>
            
            <motion.div 
              variants={fadeInUp} 
              className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 text-center"
            >
              <div className="w-12 h-12 bg-mindpop-100 dark:bg-mindpop-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-6 w-6 text-mindpop-500 dark:text-mindpop-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Excellence
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We maintain high standards in our content, technology, and support.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="mindpop-container">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose MindPop?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our platform offers unique benefits for both educators and students
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="space-y-6"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                For Students
              </h3>
              
              <motion.div variants={fadeInUp} className="flex items-start">
                <div className="mt-1 mr-4">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Personalized Learning Path
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Enjoy a customized education experience based on your progress and performance.
                  </p>
                </div>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="flex items-start">
                <div className="mt-1 mr-4">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Immediate Feedback
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Receive instant assessment results to understand your strengths and areas for improvement.
                  </p>
                </div>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="flex items-start">
                <div className="mt-1 mr-4">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Flexible Access
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Learn at your own pace, anytime and anywhere with our mobile-friendly platform.
                  </p>
                </div>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="flex items-start">
                <div className="mt-1 mr-4">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Progress Tracking
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Monitor your learning journey with detailed performance analytics.
                  </p>
                </div>
              </motion.div>
            </motion.div>
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="space-y-6"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                For Educators
              </h3>
              
              <motion.div variants={fadeInUp} className="flex items-start">
                <div className="mt-1 mr-4">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Streamlined Course Creation
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Build comprehensive courses with our intuitive content management system.
                  </p>
                </div>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="flex items-start">
                <div className="mt-1 mr-4">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Advanced Assessment Tools
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Create secure, one-time accessible quizzes with diverse question types.
                  </p>
                </div>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="flex items-start">
                <div className="mt-1 mr-4">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Detailed Analytics
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Gain insights into student performance with comprehensive data visualizations.
                  </p>
                </div>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="flex items-start">
                <div className="mt-1 mr-4">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Flexible Review Options
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Enable review modes that allow students to learn from their assessment results.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-mindpop-100 dark:bg-mindpop-600">
        <div className="mindpop-container">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Transform Your Learning Experience?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Join thousands of students and educators already using MindPop.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <a href="/register" className="mindpop-button-primary px-8 py-3 text-lg font-medium">
                Get Started Today
              </a>
              <a href="/contact" className="mindpop-button-secondary px-8 py-3 text-lg font-medium">
                Contact Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
