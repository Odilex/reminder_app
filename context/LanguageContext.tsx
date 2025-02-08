import React, { createContext, useState, useContext } from 'react';
import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

// Define available languages
export const languages = {
  en: 'English',
  rw: 'Kinyarwanda',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  zh: '中文',
};

export type Language = keyof typeof languages;

// Define translations
const translations = {
  en: {
    // Common
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    
    // Auth
    welcomeBack: 'Welcome Back',
    signInToContinue: 'Sign in to continue',
    createAccount: 'Create Account',
    signUpToGetStarted: 'Sign up to get started',
    forgotPassword: 'Forgot Password?',
    login: 'Login',
    signup: 'Sign up',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    fullName: 'Full Name',
    
    // Home
    home: 'Home',
    todaysProgress: "Today's Progress",
    searchReminders: 'Search reminders...',
    addNewReminder: 'Add New Reminder',
    aiSuggestions: 'AI Suggestions',
    todaysReminders: "Today's Reminders",
    noRemindersFound: 'No reminders found',
    
    // Categories
    all: 'All',
    work: 'Work',
    personal: 'Personal',
    shopping: 'Shopping',
    health: 'Health',
    
    // Profile
    profile: 'Profile',
    editProfile: 'Edit Profile',
    account: 'Account',
    emailPreferences: 'Email Preferences',
    notificationSettings: 'Notification Settings',
    appSettings: 'App Settings',
    theme: 'Theme',
    language: 'Language',
    syncFrequency: 'Sync Frequency',
    aiPreferences: 'AI Preferences',
    support: 'Support',
    helpCenter: 'Help Center',
    about: 'About',
    logOut: 'Log Out',
    
    // Add Reminder
    reminderTitle: 'Reminder Title',
    category: 'Category',
    priority: 'Priority',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    locationBased: 'Location-based Reminder',
    recurring: 'Recurring Reminder',
    saveReminder: 'Save Reminder',
  },
  rw: {
    // Common
    save: 'Bika',
    cancel: 'Reka',
    delete: 'Siba',
    edit: 'Hindura',
    close: 'Funga',
    
    // Auth
    welcomeBack: 'Murakaza neza',
    signInToContinue: 'Injira kugira ngo ukomeze',
    createAccount: 'Fungura konti',
    signUpToGetStarted: 'Iyandikishe kugira ngo utangire',
    forgotPassword: 'Wibagiwe ijambo ryibanga?',
    login: 'Injira',
    signup: 'Iyandikishe',
    email: 'Imeyili',
    password: 'Ijambo ryibanga',
    confirmPassword: 'Emeza ijambo ryibanga',
    fullName: 'Amazina yombi',
    
    // Home
    home: 'Ahabanza',
    todaysProgress: "Intambwe y'uyu munsi",
    searchReminders: 'Shakisha inyibutsa...',
    addNewReminder: 'Ongeraho inyibutsa nshya',
    aiSuggestions: 'Ibyifuzo bya AI',
    todaysReminders: "Inyibutsa z'uyu munsi",
    noRemindersFound: 'Nta nyibutsa zabonetse',
    
    // Categories
    all: 'Byose',
    work: 'Akazi',
    personal: 'Ibyawe',
    shopping: 'Kugura',
    health: 'Ubuzima',
    
    // Profile
    profile: 'Umwirondoro',
    editProfile: 'Hindura umwirondoro',
    account: 'Konti',
    emailPreferences: 'Imitunganyirize ya imeyili',
    notificationSettings: 'Imitunganyirize ya notifications',
    appSettings: 'Imitunganyirize ya App',
    theme: 'Isura',
    language: 'Ururimi',
    syncFrequency: 'Igihe cyo guhuza',
    aiPreferences: 'Imitunganyirize ya AI',
    support: 'Ubufasha',
    helpCenter: 'Ikigo cy\'ubufasha',
    about: 'Ibyerekeye',
    logOut: 'Sohoka',
    
    // Add Reminder
    reminderTitle: 'Umutwe w\'inyibutsa',
    category: 'Icyiciro',
    priority: 'Uburemere',
    low: 'Buke',
    medium: 'Hagati',
    high: 'Cyane',
    locationBased: 'Ishingiye ku hantu',
    recurring: 'Isubiramo',
    saveReminder: 'Bika inyibutsa',
    
    // Additional translations
    selectLanguage: 'Hitamo ururimi',
    editProfileDescription: 'Hindura amakuru y\'umwirondoro wawe',
    emailPreferencesDescription: 'Tunganya uburyo bwo kwakira imeyili',
    notificationSettingsDescription: 'Tunganya uburyo bwo kwakira notifications',
    aiMode: 'Uburyo bwa AI',
    locationLearning: 'Kwiga ahantu',
    behaviorAnalysis: 'Isesengura ry\'imyitwarire',
  },
  es: {
    // Spanish translations
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    close: 'Cerrar',
    
    welcomeBack: 'Bienvenido de nuevo',
    signInToContinue: 'Inicia sesión para continuar',
    createAccount: 'Crear cuenta',
    signUpToGetStarted: 'Regístrate para comenzar',
    forgotPassword: '¿Olvidaste tu contraseña?',
    login: 'Iniciar sesión',
    signup: 'Registrarse',
    email: 'Correo electrónico',
    password: 'Contraseña',
    confirmPassword: 'Confirmar contraseña',
    fullName: 'Nombre completo',
    
    home: 'Inicio',
    todaysProgress: 'Progreso de hoy',
    searchReminders: 'Buscar recordatorios...',
    addNewReminder: 'Añadir nuevo recordatorio',
    aiSuggestions: 'Sugerencias de IA',
    todaysReminders: 'Recordatorios de hoy',
    noRemindersFound: 'No se encontraron recordatorios',
    
    all: 'Todo',
    work: 'Trabajo',
    personal: 'Personal',
    shopping: 'Compras',
    health: 'Salud',
    
    profile: 'Perfil',
    editProfile: 'Editar perfil',
    account: 'Cuenta',
    emailPreferences: 'Preferencias de correo',
    notificationSettings: 'Configuración de notificaciones',
    appSettings: 'Configuración de la aplicación',
    theme: 'Tema',
    language: 'Idioma',
    syncFrequency: 'Frecuencia de sincronización',
    aiPreferences: 'Preferencias de IA',
    support: 'Soporte',
    helpCenter: 'Centro de ayuda',
    about: 'Acerca de',
    logOut: 'Cerrar sesión',
  },
  fr: {
    // French translations
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    close: 'Fermer',
    
    welcomeBack: 'Bon retour',
    signInToContinue: 'Connectez-vous pour continuer',
    createAccount: 'Créer un compte',
    signUpToGetStarted: 'Inscrivez-vous pour commencer',
    forgotPassword: 'Mot de passe oublié ?',
    login: 'Connexion',
    signup: "S'inscrire",
    email: 'Email',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    fullName: 'Nom complet',
    
    home: 'Accueil',
    todaysProgress: "Progrès d'aujourd'hui",
    searchReminders: 'Rechercher des rappels...',
    addNewReminder: 'Ajouter un nouveau rappel',
    aiSuggestions: 'Suggestions IA',
    todaysReminders: "Rappels d'aujourd'hui",
    noRemindersFound: 'Aucun rappel trouvé',
    
    all: 'Tout',
    work: 'Travail',
    personal: 'Personnel',
    shopping: 'Achats',
    health: 'Santé',
    
    profile: 'Profil',
    editProfile: 'Modifier le profil',
    account: 'Compte',
    emailPreferences: 'Préférences email',
    notificationSettings: 'Paramètres de notification',
    appSettings: "Paramètres de l'application",
    theme: 'Thème',
    language: 'Langue',
    syncFrequency: 'Fréquence de synchronisation',
    aiPreferences: 'Préférences IA',
    support: 'Support',
    helpCenter: "Centre d'aide",
    about: 'À propos',
    logOut: 'Déconnexion',
  },
  de: {
    // German translations
    save: 'Speichern',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    close: 'Schließen',
    
    welcomeBack: 'Willkommen zurück',
    signInToContinue: 'Melden Sie sich an, um fortzufahren',
    createAccount: 'Konto erstellen',
    signUpToGetStarted: 'Registrieren Sie sich, um loszulegen',
    forgotPassword: 'Passwort vergessen?',
    login: 'Anmelden',
    signup: 'Registrieren',
    email: 'E-Mail',
    password: 'Passwort',
    confirmPassword: 'Passwort bestätigen',
    fullName: 'Vollständiger Name',
    
    home: 'Startseite',
    todaysProgress: 'Heutiger Fortschritt',
    searchReminders: 'Erinnerungen suchen...',
    addNewReminder: 'Neue Erinnerung hinzufügen',
    aiSuggestions: 'KI-Vorschläge',
    todaysReminders: 'Heutige Erinnerungen',
    noRemindersFound: 'Keine Erinnerungen gefunden',
    
    all: 'Alle',
    work: 'Arbeit',
    personal: 'Persönlich',
    shopping: 'Einkaufen',
    health: 'Gesundheit',
    
    profile: 'Profil',
    editProfile: 'Profil bearbeiten',
    account: 'Konto',
    emailPreferences: 'E-Mail-Einstellungen',
    notificationSettings: 'Benachrichtigungseinstellungen',
    appSettings: 'App-Einstellungen',
    theme: 'Design',
    language: 'Sprache',
    syncFrequency: 'Synchronisierungsfrequenz',
    aiPreferences: 'KI-Einstellungen',
    support: 'Support',
    helpCenter: 'Hilfecenter',
    about: 'Über',
    logOut: 'Abmelden',
  },
  zh: {
    // Chinese translations
    save: '保存',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    close: '关闭',
    
    welcomeBack: '欢迎回来',
    signInToContinue: '请登录以继续',
    createAccount: '创建账户',
    signUpToGetStarted: '注册以开始使用',
    forgotPassword: '忘记密码？',
    login: '登录',
    signup: '注册',
    email: '邮箱',
    password: '密码',
    confirmPassword: '确认密码',
    fullName: '全名',
    
    home: '首页',
    todaysProgress: '今日进度',
    searchReminders: '搜索提醒...',
    addNewReminder: '添加新提醒',
    aiSuggestions: 'AI建议',
    todaysReminders: '今日提醒',
    noRemindersFound: '未找到提醒',
    
    all: '全部',
    work: '工作',
    personal: '个人',
    shopping: '购物',
    health: '健康',
    
    profile: '个人资料',
    editProfile: '编辑资料',
    account: '账户',
    emailPreferences: '邮件偏好',
    notificationSettings: '通知设置',
    appSettings: '应用设置',
    theme: '主题',
    language: '语言',
    syncFrequency: '同步频率',
    aiPreferences: 'AI偏好',
    support: '支持',
    helpCenter: '帮助中心',
    about: '关于',
    logOut: '退出登录',
  },
};

// Create i18n instance
const i18n = new I18n(translations);

// Set the default locale
i18n.locale = Localization.locale.split('-')[0];
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const changeLanguage = (lang: Language) => {
    i18n.locale = lang;
    setLanguage(lang);
  };

  const translate = (key: string) => {
    return i18n.t(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t: translate }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 