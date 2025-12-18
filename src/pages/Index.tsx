import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, Users, Calendar, Trophy, Star, ArrowRight, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import gymHero from "@/assets/gym-hero.jpg";
import { Footer } from "@/components/layouts/Footer";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { currentUser, userProfile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && currentUser && userProfile) {
      // Redirect authenticated users to their appropriate dashboard
      switch (userProfile.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'member':
          navigate('/member');
          break;
        case 'trainer':
          navigate('/trainer');
          break;
        default:
          break;
      }
    }
  }, [currentUser, userProfile, loading, navigate]);

  const features = [
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Class Booking",
      description: "Book your favorite classes with just a few clicks"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Personal Training",
      description: "Get one-on-one sessions with certified trainers"
    },
    {
      icon: <Trophy className="h-8 w-8" />,
      title: "Progress Tracking",
      description: "Monitor your fitness journey and achievements"
    },
    {
      icon: <Dumbbell className="h-8 w-8" />,
      title: "Modern Equipment",
      description: "Access to state-of-the-art fitness equipment"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Member since 2022",
      content: "This gym has completely transformed my fitness journey. The trainers are amazing!",
      rating: 5
    },
    {
      name: "Mike Chen", 
      role: "Member since 2021",
      content: "Best gym management system I've ever used. Booking classes is so easy now.",
      rating: 5
    },
    {
      name: "Emma Davis",
      role: "Member since 2023", 
      content: "Love the progress tracking features. It keeps me motivated every day!",
      rating: 5
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-800/80 backdrop-blur-md border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Dumbbell className="h-8 w-8 text-blue-500" />
            <span className="text-2xl font-bold text-blue-500">Ironclad Fitness</span>
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#features" className="text-white hover:text-blue-500 transition-colors">Features</a>
            <a href="#testimonials" className="text-white hover:text-blue-500 transition-colors">Reviews</a>
            <a href="#contact" className="text-white hover:text-blue-500 transition-colors">Contact</a>
          </div>
          <Link to="/login">
            <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white">
              Login
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${gymHero})` }}/>
        <div className="absolute inset-0 bg-gray-900/70" />
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 backdrop-blur-lg p-10 shadow-2xl rounded-md bg-gray-900/30">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
            Transform Your
            <span className="text-blue-500 block">Fitness Journey</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Experience the future of fitness with our advanced gym management system. 
            Track progress, book classes, and achieve your goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700 text-lg px-8 py-6">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900 text-lg px-8 py-6">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Choose <span className="text-blue-500">Ironclad Fitness</span>?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Advanced features designed to enhance your fitness experience
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gray-700 border-gray-600 hover:border-blue-500 transition-all duration-300 group hover:shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-blue-500 mb-4 flex justify-center group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              What Our Members Say
            </h2>
            <p className="text-xl text-gray-400">Real feedback from real people</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="text-white font-semibold">{testimonial.name}</p>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of members who have transformed their lives with Ironclad Fitness
          </p>
          <Link to="/login">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
              Join Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer/>
    </div>
  );
};

export default Index;