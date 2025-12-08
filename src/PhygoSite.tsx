import React, { useState, useEffect, useRef, ReactNode, useMemo } from 'react';
import { 
  Minus, 
  Plus, 
  ArrowRight,
  Lock,
  Sun,
  Moon,
  Instagram,
  Linkedin,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

// --- THEME CONFIGURATION ---
const useTheme = () => {
  const [theme, setTheme] = useState('light');
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  return { theme, toggleTheme };
};

// --- COMPONENTS ---

const NoiseOverlay = () => (
  <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] mix-blend-overlay"
       style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
  />
);

// --- CUSTOM CURSOR COMPONENT ---
interface CustomCursorProps {
  theme: string;
}

const CustomCursor: React.FC<CustomCursorProps> = ({ theme }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, a, input, label, [role="button"]')) {
        setIsHovering(true);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, a, input, label, [role="button"]')) {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', updatePosition);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
    };
  }, [isVisible]);

  // Colors based on theme
  const cursorColor = theme === 'dark' ? '59, 130, 246' : '5, 150, 105'; // Blue-500 or Emerald-600

  return (
    <div 
      className="fixed pointer-events-none z-[9999] hidden md:block transition-opacity duration-300"
      style={{ 
        left: position.x, 
        top: position.y,
        opacity: isVisible ? 1 : 0,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {/* Main Dot */}
      <div 
        className="rounded-full transition-all duration-300 ease-out flex items-center justify-center"
        style={{
          width: isHovering ? '64px' : '12px',
          height: isHovering ? '64px' : '12px',
          backgroundColor: isHovering ? `rgba(${cursorColor}, 0.1)` : `rgba(${cursorColor}, 1)`,
          border: isHovering ? `1px solid rgba(${cursorColor}, 0.3)` : 'none',
          backdropFilter: isHovering ? 'blur(2px)' : 'none'
        }}
      />
    </div>
  );
};

interface PhygoLogoProps {
  className?: string;
  theme?: string;
}

const PhygoLogoMinimal: React.FC<PhygoLogoProps> = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 100 100" className={`${className} fill-current`}>
    <circle cx="50" cy="50" r="15" />
    <circle cx="50" cy="15" r="8" />
    <circle cx="85" cy="50" r="8" />
    <circle cx="50" cy="85" r="8" />
    <circle cx="15" cy="50" r="8" />
    <circle cx="75" cy="25" r="6" />
    <circle cx="75" cy="75" r="6" />
    <circle cx="25" cy="75" r="6" />
    <circle cx="25" cy="25" r="6" />
  </svg>
);

interface NavLinkProps {
  children: ReactNode;
  onClick: () => void;
  theme: string;
}

const NavLink: React.FC<NavLinkProps> = ({ children, onClick, theme }) => (
  <button 
    onClick={onClick} 
    className={`text-xs uppercase tracking-widest transition-colors duration-300 flex items-center gap-1 group bg-transparent border-none cursor-pointer ${
      theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-emerald-900'
    }`}
  >
    {children}
    <div className={`w-1 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 ${
      theme === 'dark' ? 'bg-blue-600' : 'bg-emerald-600'
    }`} />
  </button>
);

interface RevealTextProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

const RevealText: React.FC<RevealTextProps> = ({ children, delay = 0, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true);
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <div className={`transform transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible ? 'translate-y-0' : 'translate-y-[110%]'}`} style={{ transitionDelay: `${delay}ms` }}>
        {children}
      </div>
    </div>
  );
};

// --- QUALIFIED FORM COMPONENT ---
interface QualifiedFormProps {
  isOpen: boolean;
  onClose: () => void;
  theme: string;
  colors: any;
}

const QualifiedForm: React.FC<QualifiedFormProps> = ({ isOpen, onClose, theme, colors }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    patrimony: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Format message for WhatsApp
    const message = `Olá, gostaria de solicitar uma consultoria.%0A%0A*Nome:* ${formData.name}%0A*Email:* ${formData.email}%0A*Telefone:* ${formData.phone}%0A*Patrimônio Investível:* ${formData.patrimony}`;
    window.open(`https://api.whatsapp.com/send/?phone=5512981153079&text=${message}`, '_blank');
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const inputClasses = `w-full bg-transparent border-b ${colors.borderSubtle} py-3 text-lg focus:outline-none focus:border-${theme === 'dark' ? 'blue-500' : 'emerald-600'} transition-colors ${colors.textMain} placeholder:text-gray-500`;

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={handleBackdropClick}
    >
      <div className={`relative w-full max-w-lg ${colors.bgSec} border ${colors.borderSubtle} shadow-2xl p-8 md:p-12 overflow-hidden animate-in zoom-in-95 duration-300`}>
        <button 
          onClick={onClose}
          className={`absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors ${colors.textMuted}`}
        >
          <X size={24} />
        </button>

        <div className="mb-8">
          <span className={`text-xs font-bold uppercase tracking-wider ${colors.accent}`}>Aplicação</span>
          <h3 className={`text-3xl md:text-4xl font-light mt-2 ${colors.textMain}`}>
            Inicie sua Jornada
          </h3>
          <p className={`mt-2 text-sm ${colors.textMuted}`}>
            Preencha seus dados para que um de nossos sócios entre em contato.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
              <div>
                <label className={`block text-xs uppercase tracking-wider ${colors.textMuted} mb-1`}>Nome Completo</label>
                <input 
                  type="text" 
                  required
                  className={inputClasses}
                  placeholder="Seu nome"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className={`block text-xs uppercase tracking-wider ${colors.textMuted} mb-1`}>E-mail Mais Utilizado</label>
                <input 
                  type="email" 
                  required
                  className={inputClasses}
                  placeholder="nome@empresa.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="flex justify-end pt-4">
                <button 
                  type="button"
                  onClick={() => {
                    if(formData.name && formData.email) setStep(2);
                  }}
                  className={`flex items-center gap-2 px-6 py-3 ${colors.textMain} border ${colors.borderSubtle} hover:${colors.bgTertiary} transition-all`}
                >
                  Próximo <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
              <div>
                <label className={`block text-xs uppercase tracking-wider ${colors.textMuted} mb-1`}>WhatsApp / Telefone</label>
                <input 
                  type="tel" 
                  required
                  className={inputClasses}
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div>
                <label className={`block text-xs uppercase tracking-wider ${colors.textMuted} mb-4`}>Patrimônio Investível</label>
                <div className="grid grid-cols-1 gap-3">
                  {['R$ 150k - R$ 500k', 'R$ 500k - R$ 1M', 'R$ 1M - R$ 5M', 'Acima de R$ 5M'].map((range) => (
                    <label 
                      key={range}
                      className={`flex items-center gap-3 p-4 border cursor-pointer transition-all ${
                        formData.patrimony === range 
                        ? `${colors.accentBorder} ${colors.accentBg}/10` 
                        : `${colors.borderSubtle} hover:bg-white/5`
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="patrimony"
                        value={range}
                        checked={formData.patrimony === range}
                        onChange={e => setFormData({...formData, patrimony: e.target.value})}
                        className="hidden"
                      />
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        formData.patrimony === range ? colors.accentBorder : 'border-gray-500'
                      }`}>
                        {formData.patrimony === range && <div className={`w-2 h-2 rounded-full ${colors.accentBg}`} />}
                      </div>
                      <span className={colors.textMain}>{range}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className={`text-sm ${colors.textMuted} hover:${colors.textMain}`}
                >
                  Voltar
                </button>
                <button 
                  type="submit"
                  disabled={!formData.phone || !formData.patrimony}
                  className={`flex items-center gap-2 px-8 py-3 ${colors.accentBg} text-white font-bold uppercase tracking-wider hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Solicitar Contato
                </button>
              </div>
            </div>
          )}
        </form>
        
        {/* Step Indicator */}
        <div className="absolute bottom-0 left-0 h-1 bg-gray-800 w-full">
          <div 
            className={`h-full ${colors.accentBg} transition-all duration-500`} 
            style={{ width: `${step * 50}%` }} 
          />
        </div>
      </div>
    </div>
  );
};

export default function PhygoLuxury() {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  // --- STYLE VARIABLES BASED ON THEME ---
  const colors = useMemo(() => ({
    bgMain: theme === 'dark' ? 'bg-[#050505]' : 'bg-[#F4F7F5]',
    bgSec: theme === 'dark' ? 'bg-[#030303]' : 'bg-white',
    bgTertiary: theme === 'dark' ? 'bg-[#080808]' : 'bg-[#EAF2EE]',
    textMain: theme === 'dark' ? 'text-white' : 'text-gray-900',
    textMuted: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
    accent: theme === 'dark' ? 'text-blue-600' : 'text-emerald-700',
    accentBg: theme === 'dark' ? 'bg-blue-600' : 'bg-emerald-700',
    accentBorder: theme === 'dark' ? 'border-blue-600' : 'border-emerald-700',
    borderSubtle: theme === 'dark' ? 'border-white/10' : 'border-emerald-900/10',
    gridLine: theme === 'dark' ? 'bg-white/[0.03]' : 'bg-emerald-900/[0.03]',
    navBg: theme === 'dark' ? 'bg-[#050505]/90' : 'bg-[#F4F7F5]/90',
  }), [theme]);

  return (
    <div className={`min-h-screen font-sans overflow-x-hidden transition-colors duration-700 ${colors.bgMain} ${colors.textMain} selection:${theme === 'dark' ? 'bg-blue-600' : 'bg-emerald-200'} selection:${theme === 'dark' ? 'text-white' : 'text-emerald-900'}`}>
      <NoiseOverlay />
      <CustomCursor theme={theme} />
      <style>{`
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: ${theme === 'dark' ? '#050505' : '#F4F7F5'}; }
        ::-webkit-scrollbar-thumb { background: ${theme === 'dark' ? '#333' : '#CBD5E1'}; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: ${theme === 'dark' ? '#2563EB' : '#047857'}; }
        
        /* HIDE DEFAULT CURSOR ON DESKTOP */
        @media (min-width: 768px) {
          body, button, a, input, label {
            cursor: none !important;
          }
        }
      `}</style>
      
      {/* --- GRID BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none transition-colors duration-700">
        <div className={`absolute left-6 md:left-24 w-px h-full ${colors.gridLine}`} />
        <div className={`absolute right-6 md:right-24 w-px h-full ${colors.gridLine}`} />
        <div className={`hidden md:block absolute left-1/3 w-px h-full ${colors.gridLine}`} />
        <div className={`hidden md:block absolute left-2/3 w-px h-full ${colors.gridLine}`} />
      </div>

      <QualifiedForm 
        isOpen={formOpen} 
        onClose={() => setFormOpen(false)} 
        theme={theme}
        colors={colors}
      />

      {/* --- HEADER --- */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? `${colors.navBg} backdrop-blur-md py-4 border-b ${colors.borderSubtle}` : 'py-8'}`}>
        <div className="w-full px-6 md:px-24 flex justify-between items-center">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <PhygoLogoMinimal className={`w-8 h-8 ${colors.textMain}`} />
            <span className="font-bold tracking-tighter text-xl hidden sm:block">PHYGO®</span>
          </div>

          <div className="hidden md:flex items-center gap-12">
            <NavLink theme={theme} onClick={() => scrollToSection('quem-somos')}>Quem Somos</NavLink>
            <NavLink theme={theme} onClick={() => scrollToSection('metodologia')}>Metodologia</NavLink>
            <NavLink theme={theme} onClick={() => scrollToSection('equipe')}>Equipe</NavLink>
            <NavLink theme={theme} onClick={() => scrollToSection('solucoes')}>Soluções</NavLink>
            <NavLink theme={theme} onClick={() => scrollToSection('faq')}>FAQ</NavLink>
          </div>

          <div className="flex items-center gap-4">
             <button 
               onClick={toggleTheme}
               className={`p-2 rounded-full transition-all duration-300 ${theme === 'dark' ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-emerald-900/10 text-emerald-800'}`}
             >
               {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
             </button>

             <button 
               className={`hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${colors.textMuted} hover:${colors.textMain}`}
               onClick={() => {}} 
             >
                <Lock size={14} />
                <span className="hidden sm:inline">Área do Cliente</span>
             </button>
             
             <button 
               onClick={() => setFormOpen(true)}
               className={`hidden sm:inline-block relative group overflow-hidden px-6 py-2 border rounded-full bg-transparent transition-colors duration-300 text-center no-underline ${theme === 'dark' ? 'border-white/20 hover:border-blue-600' : 'border-emerald-900/20 hover:border-emerald-700'}`}
             >
               <span className={`relative z-10 text-xs font-bold uppercase tracking-wider transition-colors ${theme === 'dark' ? 'group-hover:text-blue-500' : 'group-hover:text-emerald-700'}`}>Seja Cliente</span>
             </button>

             <button 
                 className="md:hidden p-2 text-current"
                 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
             >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
             </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className={`md:hidden absolute top-full left-0 w-full h-screen ${colors.bgMain} border-t ${colors.borderSubtle} p-6 flex flex-col gap-6 animate-in slide-in-from-top-10 fade-in`}>
             <NavLink theme={theme} onClick={() => scrollToSection('quem-somos')}>Quem Somos</NavLink>
             <NavLink theme={theme} onClick={() => scrollToSection('metodologia')}>Metodologia</NavLink>
             <NavLink theme={theme} onClick={() => scrollToSection('equipe')}>Equipe</NavLink>
             <NavLink theme={theme} onClick={() => scrollToSection('solucoes')}>Soluções</NavLink>
             <NavLink theme={theme} onClick={() => scrollToSection('faq')}>FAQ</NavLink>
             <div className={`h-px w-full ${colors.borderSubtle}`} />
             <button className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${colors.textMain}`}>
                <Lock size={14} /> Área do Cliente
             </button>
             <button 
               onClick={() => {
                 setMobileMenuOpen(false);
                 setFormOpen(true);
               }}
               className={`text-center py-4 border rounded-full ${theme === 'dark' ? 'border-white/20' : 'border-emerald-900/20'} ${colors.textMain} font-bold uppercase text-xs`}
             >
               Seja Cliente
             </button>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-40 md:pt-60 pb-20 px-6 md:px-24 min-h-screen flex flex-col justify-between transition-colors duration-700">
        <div className="max-w-7xl z-10">
          <RevealText>
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-12 h-[1px] ${colors.accentBg}`}></div>
              <span className={`${colors.accent} uppercase tracking-[0.2em] text-xs font-bold`}>Gestão de Ativos Independente</span>
            </div>
          </RevealText>
          
          <div className="space-y-2">
             <RevealText delay={100}>
              <h1 className="text-6xl md:text-[7rem] leading-[0.95] font-medium tracking-tight py-4">
                PATRIMÔNIO <span className={`${theme === 'dark' ? 'text-gray-700' : 'text-emerald-800/40'} italic font-serif`}>refinado</span>
              </h1>
            </RevealText>
            <RevealText delay={200}>
              <h1 className={`text-6xl md:text-[7rem] leading-[0.9] font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${theme === 'dark' ? 'from-white via-gray-400 to-gray-800' : 'from-emerald-950 via-emerald-800 to-emerald-600/50'}`}>
                PARA O FUTURO.
              </h1>
            </RevealText>
          </div>
          
          <RevealText delay={400} className="mt-12 max-w-xl">
            <p className={`text-lg md:text-xl ${colors.textMuted} font-light leading-relaxed`}>
              Gestão de patrimônio sem conflito de interesses. 
              Remuneração baseada 100% no seu sucesso. 
              <span className={`${colors.textMain} border-b ${colors.accentBorder} pb-0.5`}> Skin in the game real.</span>
            </p>
          </RevealText>
        </div>

        <div className="flex justify-between items-end mt-20 border-t border-white/10 pt-8 z-10 transition-colors duration-700">
          <div className={`hidden md:block text-xs ${colors.textMuted} uppercase tracking-widest`}>
            Sediada em São Paulo<br/>Atuação Global
          </div>
          <div className="animate-bounce">
            <ArrowRight className={`rotate-90 w-6 h-6 ${colors.accent}`} />
          </div>
        </div>
      </section>

      {/* --- STATS TICKER --- */}
      <div className={`border-y ${colors.borderSubtle} ${colors.bgTertiary} overflow-hidden whitespace-nowrap py-6 z-20 relative transition-colors duration-700`}>
        <div className="inline-flex animate-[marquee_20s_linear_infinite] gap-24 items-center">
          {[1,2,3,4].map((i) => (
             <React.Fragment key={i}>
                <span className={`text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b ${theme === 'dark' ? 'from-white to-gray-800 opacity-40' : 'from-emerald-900 to-emerald-100 opacity-20'}`}>R$ 80M+ SOB GESTÃO</span>
                <span className={`w-4 h-4 rounded-full border ${colors.accentBorder}`} />
                <span className={`text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b ${theme === 'dark' ? 'from-white to-gray-800 opacity-40' : 'from-emerald-900 to-emerald-100 opacity-20'}`}>+120 FAMÍLIAS</span>
                <span className={`w-4 h-4 rounded-full ${colors.accentBg}`} />
             </React.Fragment>
          ))}
        </div>
      </div>

      {/* --- QUEM SOMOS --- */}
      <section id="quem-somos" className={`py-32 px-6 md:px-24 ${colors.bgSec} relative transition-colors duration-700`}>
         <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
            <div className="md:col-span-5">
              <RevealText>
                 <h2 className={`text-xs font-bold ${colors.accent} tracking-widest uppercase mb-8 flex items-center gap-3`}>
                    <span className={`w-2 h-2 ${colors.accentBg} rounded-full`}></span>
                    Nossa Trajetória
                 </h2>
              </RevealText>
              <RevealText delay={100}>
                <h3 className="text-4xl md:text-5xl font-light mb-8 leading-tight">
                  Construindo legado,<br/>
                  <span className={`${colors.textMuted} font-serif italic`}>ano após ano.</span>
                </h3>
              </RevealText>
              
              <p className={`${colors.textMuted} leading-relaxed text-lg mb-10`}>
                Fundada em Taubaté e presente nos principais centros financeiros do país, a Phygo é uma instituição construída por uma equipe multidisciplinar de alta performance. Uma história forjada pela excelência técnica coletiva e reconhecimento nacional.
              </p>

              <div className={`flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider ${colors.textMain}`}>
                <div className={`px-4 py-2 border ${colors.borderSubtle} rounded-full`}>6 Profissionais Certificados</div>
                <div className={`px-4 py-2 border ${colors.borderSubtle} rounded-full`}>CGA • CEA • CFP®</div>
              </div>
              
              <div className={`mt-12 pt-8 border-t ${colors.borderSubtle}`}>
                 <p className={`text-xs ${colors.textMuted} mb-4 uppercase tracking-widest`}>Plataformas Parceiras</p>
                 <div className="flex gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                    <span className={`text-2xl font-bold font-serif ${colors.textMain}`}>BTG Pactual</span>
                    <span className={`text-2xl font-bold font-sans ${colors.textMain}`}>XP</span>
                 </div>
              </div>
            </div>

            <div className={`md:col-span-7 relative pl-8 border-l ${colors.borderSubtle} space-y-16`}>
               {[
                 { year: '2018', title: 'O Início', desc: 'Início da atuação no mercado financeiro e conquista das primeiras certificações técnicas da equipe.' },
                 { year: '2019', title: 'Assessoria Private', desc: 'Consolidação das operações de assessoria particular e gestão de patrimônio em Goiânia.' },
                 { year: '2021', title: 'Fundação Phygo', desc: 'Nascimento oficial da Phygo Gestão de Ativos em Taubaté - SP.' },
                 { year: '2022', title: 'Reconhecimento Nacional', desc: 'Equipe de gestão atinge o Top 3 Brasil no desafio Safra Top Gestores, entre mais de 250 assets.' },
                 { year: '2024', title: 'Expansão Sólida', desc: 'Phygo atinge a marca de 100 clientes ativos e mais de R$ 80M sob gestão.' },
                 { year: '2025', title: 'Novos Horizontes', desc: 'Expansão institucional e inauguração das operações em São José dos Campos e São Paulo.' }
               ].map((item, idx) => (
                 <div key={idx} className="relative group">
                    <div className={`absolute -left-[41px] top-1 w-5 h-5 ${colors.bgSec} border-2 ${colors.borderSubtle} rounded-full group-hover:${colors.accentBorder} group-hover:${colors.accentBg} transition-colors duration-500`} />
                    <div className="flex flex-col md:flex-row gap-4 md:items-baseline">
                      <span className={`text-4xl font-bold ${theme === 'dark' ? 'text-white/20 group-hover:text-white/40' : 'text-emerald-900/20 group-hover:text-emerald-900/40'} transition-colors duration-500 font-mono`}>{item.year}</span>
                      <div>
                        <h4 className={`text-xl font-bold ${colors.textMain} mb-2`}>{item.title}</h4>
                        <p className={`${colors.textMuted} text-sm max-w-md`}>{item.desc}</p>
                      </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* --- EQUIPE --- */}
      <section id="equipe" className={`py-32 px-6 md:px-24 border-t ${colors.borderSubtle} ${colors.bgMain} transition-colors duration-700`}>
        <div className="max-w-7xl">
          <RevealText>
             <h2 className={`text-xs font-bold ${colors.accent} tracking-widest uppercase mb-8 flex items-center gap-3`}>
                <span className={`w-2 h-2 ${colors.accentBg} rounded-full`}></span>
                Nossa Equipe
             </h2>
          </RevealText>
          <RevealText delay={100}>
            <h3 className={`text-4xl md:text-5xl font-light mb-16 leading-tight ${colors.textMain}`}>
              Quem cuida do <span className={`${colors.textMuted} font-serif italic`}>seu legado.</span>
            </h3>
          </RevealText>
          
          <div className="mb-16 rounded-xl overflow-hidden border border-white/10 relative group">
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
            <img 
              src="/team/equipe_geral.jpg" 
              alt="Equipe Phygo Gestão de Ativos" 
              className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 grayscale group-hover:grayscale-0"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                name: 'Maurício', 
                role: 'Sócio Fundador & Gestor', 
                desc: 'CGA, CFP®. Especialista em alocação de ativos e gestão de portfólios de alta renda. Top 3 Safra Gestores 2022.',
                photo: '/team/mauricio.jpg'
              },
              { 
                name: 'Gabriel Madona', 
                role: 'Sócio Administrativo', 
                desc: 'Responsável pela diretoria financeira e administrativa, garantindo a solidez operacional da Phygo.',
                photo: '/team/gabriel.jpg'
              },
              { 
                name: 'Giovanni Mazzuco', 
                role: 'Comercial', 
                desc: 'Head de Relacionamento e expansão, focado em oferecer um atendimento personalizado e exclusivo aos clientes.',
                photo: '/team/giovanni.jpg'
              },
              { 
                name: 'Juliana Hartwig', 
                role: 'Portfolio Manager', 
                desc: 'Gestora de portfólios dedicada à estratégia de alocação e monitoramento constante de ativos.',
                photo: '/team/juliana.jpg'
              },
              { 
                name: 'Christian Santana', 
                role: 'Portfolio Manager', 
                desc: 'Gestor focado em performance. Top 18 na competição nacional de traders do BTG Pactual.',
                photo: '/team/christian.jpg'
              }
            ].map((member, idx) => (
              <div key={idx} className={`group relative overflow-hidden ${theme === 'dark' ? 'bg-white/[0.02]' : 'bg-white shadow-sm'} border ${colors.borderSubtle} p-8 transition-all duration-500 hover:-translate-y-2`}>
                <div className={`w-24 h-24 mb-6 rounded-full ${colors.bgTertiary} border ${colors.borderSubtle} overflow-hidden`}>
                   <img src={member.photo} alt={member.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                </div>
                <h4 className={`text-xl font-bold ${colors.textMain} mb-1`}>{member.name}</h4>
                <span className={`text-xs uppercase tracking-wider ${colors.accent} mb-4 block`}>{member.role}</span>
                <p className={`text-sm ${colors.textMuted} leading-relaxed`}>
                  {member.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- METODOLOGIA --- */}
      <section id="metodologia" className={`py-32 px-6 md:px-24 border-y ${colors.borderSubtle} relative ${colors.bgMain} transition-colors duration-700`}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <h2 className={`text-xs font-bold ${colors.accent} tracking-widest uppercase mb-8 flex items-center gap-3`}>
              <span className={`w-2 h-2 ${colors.accentBg} rounded-full`}></span>
              O Modelo Phygo
            </h2>
            <p className="text-3xl font-light leading-snug">
              Bancos tradicionais lucram na movimentação. <br/>
              <span className={colors.textMuted}>Nós lucramos no resultado.</span>
            </p>
          </div>
          
          <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className={`p-8 border ${colors.borderSubtle} ${theme === 'dark' ? 'bg-white/[0.02] hover:bg-white/[0.05]' : 'bg-white shadow-sm hover:shadow-md'} transition-all duration-500 group`}>
              <Minus className={`${colors.textMuted} mb-6 group-hover:text-red-500 transition-colors`} />
              <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-gray-400 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'} transition-colors`}>Modelo Tradicional</h3>
              <p className={`text-sm ${colors.textMuted} mb-6`}>Taxas fixas, comissões ocultas (rebate) e conflito de interesse. O banco ganha mesmo se você perder.</p>
              <div className={`text-4xl font-light ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>Taxa Fixa</div>
            </div>

            <div className={`p-8 border ${theme === 'dark' ? 'border-blue-900/30 bg-blue-900/[0.05] hover:bg-blue-900/[0.1]' : 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100'} transition-all duration-500 group relative overflow-hidden`}>
              <div className="absolute top-0 right-0 p-4 opacity-20">
                 <PhygoLogoMinimal className={`w-24 h-24 ${theme === 'dark' ? 'text-blue-500' : 'text-emerald-500'}`} />
              </div>
              <Plus className={`${theme === 'dark' ? 'text-blue-500' : 'text-emerald-600'} mb-6`} />
              <h3 className={`text-xl font-bold mb-2 ${colors.textMain}`}>Modelo Phygo</h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-blue-200/60' : 'text-emerald-800/60'} mb-6`}>Taxa de sucesso apenas. Transparência total. Alinhamento de 100%.</p>
              <div className={`text-4xl font-light ${theme === 'dark' ? 'text-blue-400' : 'text-emerald-600'}`}>Success Fee</div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SOLUÇÕES (ANTIGO SERVIÇOS) --- */}
      <section id="solucoes" className={`${colors.bgSec} transition-colors duration-700`}>
        {[
          { id: '01', title: 'Gestão Patrimonial', desc: 'Estruturação holística de patrimônio e investimentos.' },
          { id: '02', title: 'Alocação Global', desc: 'Acesso a mercados internacionais e moedas fortes.' },
          { id: '03', title: 'Criptoativos', desc: 'Exposição regulada e segura a ativos digitais.' },
          { id: '04', title: 'Consultoria', desc: 'Planejamento tributário e sucessório especializado.' }
        ].map((service, idx) => (
          <div key={idx} className={`group border-b ${colors.borderSubtle} py-12 px-6 md:px-24 ${theme === 'dark' ? 'hover:bg-white/[0.02]' : 'hover:bg-emerald-900/[0.03]'} transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between`}>
            <div className="flex items-baseline gap-8">
              <span className={`text-xs font-mono ${theme === 'dark' ? 'text-gray-600 group-hover:text-blue-500' : 'text-gray-400 group-hover:text-emerald-600'} transition-colors`}>({service.id})</span>
              <h3 className={`text-3xl md:text-5xl font-light ${theme === 'dark' ? 'text-gray-300 group-hover:text-white' : 'text-gray-500 group-hover:text-emerald-950'} transition-all group-hover:translate-x-4`}>
                {service.title}
              </h3>
            </div>
            <p className={`mt-4 md:mt-0 text-sm ${colors.textMuted} md:opacity-0 md:translate-x-[-20px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 max-w-xs text-right`}>
              {service.desc}
            </p>
          </div>
        ))}
      </section>

      {/* --- FAQ --- */}
      <section id="faq" className={`py-32 px-6 md:px-24 ${colors.bgMain} transition-colors duration-700`}>
         <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
               <h2 className={`text-xs font-bold ${colors.accent} tracking-widest uppercase mb-4`}>Dúvidas Frequentes</h2>
               <h3 className={`text-3xl md:text-4xl font-light ${colors.textMain}`}>Entenda como trabalhamos</h3>
            </div>

            <div className="space-y-4">
               {[
                 { q: 'Qual o mínimo para investir?', a: 'Para acessar nossas carteiras administradas e serviço de wealth management completo, recomendamos um patrimônio investível a partir de R$ 150.000,00. Contudo, avaliamos cada caso individualmente para propor a melhor solução.' },
                 { 
                    q: 'Como funciona a taxa de performance?', 
                    a: (
                      <div className="space-y-4">
                        <p>Nosso modelo é baseado no sucesso do cliente. Cobramos uma taxa de performance apenas sobre o lucro trimestral da carteira. Quanto maior o seu patrimônio sob gestão, menor é a taxa cobrada.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                           <div className={`p-4 rounded border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                              <div className="text-xs uppercase tracking-wider opacity-70 mb-1">R$ 150k - R$ 250k</div>
                              <div className={`text-2xl font-bold ${colors.accent}`}>15%</div>
                              <div className="text-[10px] opacity-60">sobre o lucro</div>
                           </div>
                           <div className={`p-4 rounded border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                              <div className="text-xs uppercase tracking-wider opacity-70 mb-1">R$ 250k - R$ 400k</div>
                              <div className={`text-2xl font-bold ${colors.accent}`}>10%</div>
                              <div className="text-[10px] opacity-60">sobre o lucro</div>
                           </div>
                           <div className={`p-4 rounded border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                              <div className="text-xs uppercase tracking-wider opacity-70 mb-1">Acima de R$ 400k</div>
                              <div className={`text-2xl font-bold ${colors.accent}`}>8%</div>
                              <div className="text-[10px] opacity-60">sobre o lucro</div>
                           </div>
                        </div>
                      </div>
                    )
                 },
                 { q: 'O dinheiro fica no meu nome?', a: 'Sim. Todo o recurso permanece sob sua titularidade, custodiado em instituições financeiras de primeira linha (como BTG Pactual ou XP Investimentos). A Phygo possui apenas a procuração para realizar a gestão (compra e venda de ativos), sem qualquer poder de saque ou transferência.' },
                 { q: 'Como acompanho meus investimentos?', a: 'Você terá acesso à área do cliente em nosso portal e também aos aplicativos das corretoras parceiras, garantindo transparência total e em tempo real de todas as movimentações e rentabilidade.' }
               ].map((item, idx) => (
                  <details key={idx} className={`group border ${colors.borderSubtle} ${theme === 'dark' ? 'bg-white/[0.02]' : 'bg-white'} rounded-lg overflow-hidden transition-all duration-300`}>
                     <summary className={`flex justify-between items-center p-6 cursor-pointer list-none ${colors.textMain} font-medium hover:${theme === 'dark' ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                        <span>{item.q}</span>
                        <ChevronDown className={`transform group-open:rotate-180 transition-transform duration-300 ${colors.textMuted}`} size={20} />
                     </summary>
                     <div className={`px-6 pb-6 text-sm ${colors.textMuted} leading-relaxed animate-in slide-in-from-top-2`}>
                        {item.a}
                     </div>
                  </details>
               ))}
            </div>
         </div>
      </section>

      {/* --- CTA / FOOTER --- */}
      <footer className={`${colors.bgMain} pt-32 pb-12 px-6 md:px-24 border-t ${colors.borderSubtle} transition-colors duration-700`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20">
          <div>
             <h2 className="text-4xl md:text-6xl font-bold mb-8 max-w-2xl leading-tight">
               Pronto para elevar <br/> seu legado financeiro?
             </h2>
             <button 
               onClick={() => setFormOpen(true)}
               className={`bg-white text-black px-8 py-4 text-sm font-bold uppercase tracking-widest hover:${colors.accentBg} hover:text-white transition-all duration-300 flex items-center gap-4 group w-fit ${theme === 'light' ? 'border border-emerald-900/10' : ''}`}
             >
               Torne-se Cliente <ArrowRight className="group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
          <div className="mt-12 md:mt-0 text-right">
            <div className={`text-sm ${colors.textMuted} mb-2`}>Escritórios</div>
            <div className={`text-xl ${colors.textMain}`}>Taubaté • São Paulo • SJC • Goiânia</div>
            <div className={`mt-8 text-sm ${colors.textMuted} mb-2`}>Contato</div>
            <div className={`text-xl ${colors.textMain} hover:${colors.accent} cursor-pointer`}>atendimento@phygo.com</div>
          </div>
        </div>

        {/* --- DISCLAIMER LEGAL --- */}
        <div className={`mb-12 text-[10px] leading-relaxed ${colors.textMuted} opacity-70 text-justify border-t ${colors.borderSubtle} pt-8`}>
            <p className="mb-4">
              <strong>Aviso Legal:</strong> A Phygo Gestão de Ativos é uma instituição autorizada pela Comissão de Valores Mobiliários (CVM) para o exercício da atividade de administração de carteiras de valores mobiliários. 
              O investimento em carteiras administradas e ativos financeiros está sujeito a riscos de mercado, incluindo a possibilidade de perda do capital investido e a ausência de garantias por parte do administrador, do gestor ou de mecanismos de seguro.
            </p>
            <p>
              Rentabilidade passada não representa garantia de rentabilidade futura. As informações contidas neste site têm caráter meramente informativo e não constituem oferta pública de valores mobiliários, solicitação de compra ou recomendação personalizada de investimento. 
              A gestão de carteiras administradas é realizada de acordo com o perfil de risco e objetivos de cada cliente, formalizados em contrato específico.
              A Phygo não se responsabiliza por decisões de investimento tomadas com base nas informações aqui divulgadas.
            </p>
        </div>

        <div className={`flex flex-col md:flex-row justify-between items-center pt-8 border-t ${colors.borderSubtle} text-xs ${colors.textMuted} uppercase tracking-wider`}>
          <div className="flex gap-6 mb-4 md:mb-0">
             <span>© 2025 Phygo Gestão de Ativos</span>
             <span>Autorizada CVM</span>
          </div>
          <div className="flex gap-6 items-center">
            <a 
              href="https://www.instagram.com/phygoinvestimentos/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`hover:${colors.textMain} transition-colors p-2`}
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a 
              href="https://www.linkedin.com/company/phygoinvestimentos" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`hover:${colors.textMain} transition-colors p-2`}
              aria-label="LinkedIn"
            >
              <Linkedin size={20} />
            </a>
          </div>
        </div>
      </footer>
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}