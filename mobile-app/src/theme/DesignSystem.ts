/**
 * Comprix Premium Design System & Visual Tokens
 * 
 * Ecosistema visual unificado inspirado en Revolut Premium, Nubank Ultravioleta y Apple Wallet.
 * Proporciona colores, espaciados, tipografías, gradientes y sombras consistentes tanto para
 * el Modo Claro como para el Modo Oscuro.
 */

import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// 1. PALETA DE COLORES GLOBAL (Fintech & Premium)
export const themeColors = {
  light: {
    background: '#FAFAFA',      // Fondo base ultra limpio
    surface: '#FFFFFF',         // Superficie de tarjetas blancas
    surfaceAlt: '#F8FAFC',      // Superficie secundaria gris claro
    border: '#E2E8F0',          // Bordes muy suaves
    borderActive: '#7C3AED',    // Borde activo (Morado premium)
    
    // Jerarquía de textos
    textPrimary: '#0F172A',     // Navy oscuro (Alta lectura)
    textSecondary: '#475569',   // Gris slate oscuro (Subtítulos)
    textMuted: '#64748B',       // Gris slate medio (Textos secundarios)
    textLight: '#94A3B8',       // Gris slate claro (Placeholders, deshabilitados)
    
    // Colores de marca
    primary: '#10B981',         // Verde premium (Éxito, Ahorro, Acción principal)
    primaryHover: '#059669',    // Verde oscuro
    primaryLight: '#F0FDF4',    // Fondo verde pastel suave
    
    // Premium / Especiales
    premium: '#7C3AED',         // Morado premium (Plus/Pro, Exclusivo)
    premiumDark: '#6D28D9',     // Morado oscuro
    premiumLight: '#F5F3FF',    // Fondo morado pastel suave
    premiumLightAlt: '#EDE9FE', // Fondo morado pastel alternativo
    
    // Alertas y estados
    danger: '#EF4444',          // Rojo suave (Exceso de presupuesto)
    dangerLight: '#FEF2F2',     // Fondo rojo pastel
    warning: '#F59E0B',         // Naranja suave (Advertencias)
    warningLight: '#FFFBEB',    // Fondo naranja pastel
    info: '#3B82F6',            // Azul suave
    infoLight: '#EFF6FF',       // Fondo azul pastel
  },
  dark: {
    background: '#0F172A',      // Fondo base slate muy oscuro (iOS modern style)
    surface: '#1E293B',         // Superficie de tarjetas oscuras
    surfaceAlt: '#334155',      // Superficie secundaria
    border: '#334155',          // Bordes oscuros suaves
    borderActive: '#8B5CF6',    // Borde activo morado suave
    
    // Jerarquía de textos
    textPrimary: '#F8FAFC',     // Blanco puro para alto contraste
    textSecondary: '#E2E8F0',   // Gris ultra claro
    textMuted: '#94A3B8',       // Gris slate claro
    textLight: '#64748B',       // Gris slate medio
    
    // Colores de marca
    primary: '#34D399',         // Verde premium brillante
    primaryHover: '#10B981',    // Verde medio
    primaryLight: '#064E3B',    // Fondo verde muy oscuro
    
    // Premium / Especiales
    premium: '#A78BFA',         // Morado premium brillante
    premiumDark: '#8B5CF6',     // Morado medio
    premiumLight: '#2E1065',    // Fondo morado muy oscuro
    premiumLightAlt: '#3B0764',
    
    // Alertas y estados
    danger: '#F87171',          // Rojo brillante
    dangerLight: '#7F1D1D',     // Rojo muy oscuro
    warning: '#FBBF24',         // Naranja brillante
    warningLight: '#78350F',    // Naranja muy oscuro
    info: '#60A5FA',            // Azul brillante
    infoLight: '#1E3A8A',       // Azul muy oscuro
  }
};

// 2. GRADIENTES ELEGANTES Y PREMIUM
export const themeGradients = {
  // Gradiente de ahorro principal (Verde esmeralda a menta)
  savings: {
    colors: ['#047857', '#10B981'],
    colorsDark: ['#064E3B', '#059669'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 }
  },
  // Gradiente Premium Plus/Pro (Morado real a violeta)
  premium: {
    colors: ['#7C3AED', '#6D28D9'],
    colorsDark: ['#8B5CF6', '#7C3AED'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 }
  },
  // Gradiente Fintech neutro (Gris slate a navy)
  neutral: {
    colors: ['#1E293B', '#0F172A'],
    colorsDark: ['#334155', '#1E293B'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 }
  },
  // Gradiente suave de fondo para tarjetas destacadas
  softCard: {
    colors: ['#F8FAFC', '#F1F5F9'],
    colorsDark: ['#1E293B', '#0F172A'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 }
  }
};

// 3. TOKENS DE DISEÑO DE LAYOUT Y FRONTERAS (Apple Minimalist)
export const themeLayout = {
  window: {
    width,
    height
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,      // Look Premium (tarjetas, botones principales)
    xxl: 24,     // Look Apple premium extremo (Paywall, Botón de suscripción)
    round: 9999,
  },
  borderWidth: {
    thin: 1,
    medium: 2,
    thick: 3
  }
};

// 4. SOMBRAS SUAVES E INMERSIVAS (iOS-Like Glassmorphism Style)
export const themeShadows = {
  soft: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  medium: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  premium: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 8,
  },
  success: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 6,
  }
};

// 5. TIPOGRAFÍA Y JERARQUÍA VISUAL (SF Pro / Inter Style)
export const themeTypography = {
  fontSizes: {
    xs: 12,      // Subtextos secundarios
    sm: 13,      // Descripciones, textos auxiliares
    md: 15,      // Textos del cuerpo, inputs
    lg: 18,      // Títulos de sección, nombres de planes
    xl: 22,      // Títulos secundarios
    xxl: 28,     // Títulos grandes de marca o KPI (ahorros)
    huge: 36,     // Grandes números / porcentajes destacados
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extraBold: '800' as const,
  },
  lineHeights: {
    sm: 18,
    md: 22,
    lg: 26,
    xl: 32,
  }
};
