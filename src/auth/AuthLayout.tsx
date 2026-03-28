import { type ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  heroTitle: string;
  heroSubtitle: string;
  heroEmoji: string;
  heroFeatures?: string[];
  heroStats?: { value: string; label: string }[];
  showBackButton?: boolean;
  onBack?: () => void;
}

export default function AuthLayout({ 
  children, 
  heroTitle, 
  heroSubtitle, 
  heroEmoji,
  heroFeatures,
  heroStats,
  showBackButton = false,
  onBack 
}: AuthLayoutProps) {
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: 'linear-gradient(to bottom right, rgba(239, 246, 255, 0.9), rgba(255, 255, 255, 0.9), rgba(236, 253, 245, 0.9)), url(/man-on-mobile-jacaranda.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="w-full max-w-6xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Hero Section */}
          <div className="text-center lg:text-left space-y-6 animate-slide-in-left">
            {showBackButton && onBack && (
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
            
            <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-emerald-100 rounded-3xl flex items-center justify-center text-4xl mx-auto lg:mx-0 shadow-lg">
              {heroEmoji}
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary-600 to-emerald-600 bg-clip-text text-transparent">
                {heroTitle}
              </h1>
              <p className="text-lg lg:text-xl text-gray-600 leading-relaxed">
                {heroSubtitle}
              </p>
            </div>
            
            {/* Stats */}
            {heroStats && (
              <div className="grid grid-cols-3 gap-4 pt-4">
                {heroStats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold text-primary-600">
                      {stat.value}
                    </div>
                    <div className="text-xs lg:text-sm text-gray-600">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Features */}
            <div className="hidden lg:block space-y-4 pt-6">
              {heroFeatures?.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-gray-700">
                  <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                  </div>
                  <span className="text-sm">{feature}</span>
                </div>
              )) || (
                <>
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                    </div>
                    <span className="text-sm">Secure authentication</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                    </div>
                    <span className="text-sm">Easy account management</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                    </div>
                    <span className="text-sm">24/7 support available</span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Form Section */}
          <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 animate-slide-in-right">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
