import React, { createContext, useState, useContext, useEffect } from 'react';
import * as Localization from 'expo-localization';
import I18n from 'i18n-js';

// Define available languages
export const languages = {
  en: 'English',
  rw: 'Kinyarwanda',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  zh: '中文',
} as const;

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
    
    // Form Validation
    emailRequired: 'Email is required',
    passwordRequired: 'Password is required',
    fullNameRequired: 'Full name is required',
    invalidEmail: 'Please enter a valid email address',
    passwordTooShort: 'Password must be at least 6 characters',
    
    // Auth Errors
    error: 'Error',
    loginError: 'Login failed',
    userNotFound: 'No user found with this email',
    wrongPassword: 'Incorrect password',
    
    // Auth UI
    or: 'OR',
    dontHaveAccount: "Don't have an account? Sign up",

    // Signup Validation & Errors
    passwordsDoNotMatch: 'Passwords do not match',
    signupError: 'Failed to create account',
    emailAlreadyInUse: 'This email is already registered',
    weakPassword: 'Password is too weak',
    alreadyHaveAccount: 'Already have an account? Login',

    // Reset Password
    resetPassword: 'Reset Password',
    resetPasswordInstructions: 'Enter your email address and we\'ll send you instructions to reset your password.',
    resetPasswordEmailSent: 'Password reset email sent. Please check your inbox.',
    resetPasswordError: 'Failed to send reset email',
    sendResetLink: 'Send Reset Link',
    backToLogin: 'Back to Login',
    success: 'Success',
    ok: 'OK',

    // Auth Success Messages
    verificationEmailSent: 'Verification email sent. Please check your inbox.',
    profileUpdateSuccess: 'Profile updated successfully.',
    emailUpdateSuccess: 'Email updated successfully. Please verify your new email.',
    passwordUpdateSuccess: 'Password updated successfully.',
    recentLoginRequired: 'Please log in again to continue this action.',

    // Auth Additional
    emailVerification: 'Email Verification',
    resendVerification: 'Resend Verification Email',
    updateProfile: 'Update Profile',
    updateEmail: 'Update Email',
    updatePassword: 'Update Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    verifyEmail: 'Please verify your email',

    // Network and Server Errors
    noInternetConnection: 'No internet connection. Please check your network.',
    serverError: 'Server is currently unavailable. Please try again later.',
    networkError: 'Network error. Please check your connection.',
    tooManyRequests: 'Too many attempts. Please try again later.',
    operationNotAllowed: 'This operation is not allowed.',
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
    
    // Form Validation
    emailRequired: 'Imeyili irakenewe',
    passwordRequired: 'Ijambo ryibanga rirakenewe',
    fullNameRequired: 'Amazina yombi arakenewe',
    invalidEmail: 'Shyiramo imeyili yemewe',
    passwordTooShort: 'Ijambo ryibanga rigomba kuba byibura inyuguti 6',
    
    // Auth Errors
    error: 'Ikosa',
    loginError: 'Kwinjira byanze',
    userNotFound: 'Nta mukoresha uboneka kuri iyi imeyili',
    wrongPassword: 'Ijambo ryibanga ritari ryo',
    
    // Auth UI
    or: 'CYANGWA',
    dontHaveAccount: 'Nta konti ufite? Iyandikishe',

    // Signup Validation & Errors
    passwordsDoNotMatch: 'Amagambo y\'ibanga ntabwo ahura',
    signupError: 'Kwiyandikisha byanze',
    emailAlreadyInUse: 'Iyi imeyili isanzwe yanditse',
    weakPassword: 'Ijambo ry\'ibanga ntirihagije',
    alreadyHaveAccount: 'Usanzwe ufite konti? Injira',

    // Reset Password
    resetPassword: 'Guhindura ijambo ryibanga',
    resetPasswordInstructions: 'Andika imeyili yawe maze tuzakoherereza amabwiriza yo guhindura ijambo ryibanga.',
    resetPasswordEmailSent: 'Imeyili yo guhindura ijambo ryibanga yoherejwe. Reba imeyili yawe.',
    resetPasswordError: 'Byanze kohereza imeyili',
    sendResetLink: 'Ohereza',
    backToLogin: 'Garuka ku kwinjira',
    success: 'Byagenze neza',
    ok: 'OYA',

    // Auth Success Messages
    verificationEmailSent: 'Imeyili yo kwemeza yoherejwe. Reba imeyili yawe.',
    profileUpdateSuccess: 'Umwirondoro wavuguruwe neza.',
    emailUpdateSuccess: 'Imeyili yavuguruwe neza. Nyamuneka emeza imeyili yawe nshya.',
    passwordUpdateSuccess: 'Ijambo ryibanga ryavuguruwe neza.',
    recentLoginRequired: 'Nyamuneka ongera winjire kugirango ukomeze iyi gikora.',

    // Auth Additional
    emailVerification: 'Kwemeza Imeyili',
    resendVerification: 'Ongera Wohereze Imeyili yo Kwemeza',
    updateProfile: 'Kuvugurura Umwirondoro',
    updateEmail: 'Kuvugurura Imeyili',
    updatePassword: 'Kuvugurura Ijambo ryibanga',
    currentPassword: 'Ijambo ryibanga rya none',
    newPassword: 'Ijambo ryibanga rishya',
    verifyEmail: 'Nyamuneka emeza imeyili yawe',

    // Network and Server Errors
    noInternetConnection: 'Nta murandasi. Nyamuneka reba umuyoboro wawe.',
    serverError: 'Seriveri ntiboneka. Nyamuneka ongera ugerageze nyuma.',
    networkError: 'Ikibazo cy\'umuyoboro. Nyamuneka reba umuyoboro wawe.',
    tooManyRequests: 'Wagerageje kenshi cyane. Nyamuneka ongera ugerageze nyuma.',
    operationNotAllowed: 'Iki gikorwa ntikemewe.',
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
    
    // Form Validation
    emailRequired: 'El correo electrónico es requerido',
    passwordRequired: 'La contraseña es requerida',
    fullNameRequired: 'El nombre completo es requerido',
    invalidEmail: 'Por favor ingrese un correo electrónico válido',
    passwordTooShort: 'La contraseña debe tener al menos 6 caracteres',
    
    // Auth Errors
    error: 'Error',
    loginError: 'Error al iniciar sesión',
    userNotFound: 'No se encontró ningún usuario con este correo',
    wrongPassword: 'Contraseña incorrecta',
    
    // Auth UI
    or: 'O',
    dontHaveAccount: '¿No tienes una cuenta? Regístrate',

    // Signup Validation & Errors
    passwordsDoNotMatch: 'Las contraseñas no coinciden',
    signupError: 'Error al crear la cuenta',
    emailAlreadyInUse: 'Este correo ya está registrado',
    weakPassword: 'La contraseña es demasiado débil',
    alreadyHaveAccount: '¿Ya tienes una cuenta? Inicia sesión',

    // Reset Password
    resetPassword: 'Restablecer Contraseña',
    resetPasswordInstructions: 'Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.',
    resetPasswordEmailSent: 'Correo de restablecimiento enviado. Por favor revisa tu bandeja de entrada.',
    resetPasswordError: 'Error al enviar el correo',
    sendResetLink: 'Enviar Link',
    backToLogin: 'Volver al Login',
    success: 'Éxito',
    ok: 'OK',

    // Auth Success Messages
    verificationEmailSent: 'Correo de verificación enviado. Por favor revisa tu bandeja de entrada.',
    profileUpdateSuccess: 'Perfil actualizado exitosamente.',
    emailUpdateSuccess: 'Correo actualizado exitosamente. Por favor verifica tu nuevo correo.',
    passwordUpdateSuccess: 'Contraseña actualizada exitosamente.',
    recentLoginRequired: 'Por favor inicia sesión nuevamente para continuar con esta acción.',

    // Auth Additional
    emailVerification: 'Verificación de Correo',
    resendVerification: 'Reenviar Correo de Verificación',
    updateProfile: 'Actualizar Perfil',
    updateEmail: 'Actualizar Correo',
    updatePassword: 'Actualizar Contraseña',
    currentPassword: 'Contraseña Actual',
    newPassword: 'Nueva Contraseña',
    verifyEmail: 'Por favor verifica tu correo',

    // Network and Server Errors
    noInternetConnection: 'Sin conexión a internet. Por favor verifica tu red.',
    serverError: 'El servidor no está disponible. Por favor intenta más tarde.',
    networkError: 'Error de red. Por favor verifica tu conexión.',
    tooManyRequests: 'Demasiados intentos. Por favor intenta más tarde.',
    operationNotAllowed: 'Esta operación no está permitida.',
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
    
    // Form Validation
    emailRequired: "L'email est requis",
    passwordRequired: 'Le mot de passe est requis',
    fullNameRequired: 'Le nom complet est requis',
    invalidEmail: 'Veuillez entrer une adresse email valide',
    passwordTooShort: 'Le mot de passe doit contenir au moins 6 caractères',
    
    // Auth Errors
    error: 'Erreur',
    loginError: 'Échec de la connexion',
    userNotFound: 'Aucun utilisateur trouvé avec cet email',
    wrongPassword: 'Mot de passe incorrect',
    
    // Auth UI
    or: 'OU',
    dontHaveAccount: 'Pas de compte ? Inscrivez-vous',

    // Signup Validation & Errors
    passwordsDoNotMatch: 'Les mots de passe ne correspondent pas',
    signupError: 'Échec de la création du compte',
    emailAlreadyInUse: 'Cet email est déjà enregistré',
    weakPassword: 'Le mot de passe est trop faible',
    alreadyHaveAccount: 'Déjà un compte ? Connectez-vous',

    // Reset Password
    resetPassword: 'Réinitialiser le mot de passe',
    resetPasswordInstructions: 'Entrez votre adresse e-mail et nous vous enverrons les instructions pour réinitialiser votre mot de passe.',
    resetPasswordEmailSent: 'E-mail de réinitialisation envoyé. Veuillez vérifier votre boîte de réception.',
    resetPasswordError: 'Échec de l\'envoi de l\'e-mail',
    sendResetLink: 'Envoyer le lien',
    backToLogin: 'Retour à la connexion',
    success: 'Succès',
    ok: 'OK',

    // Auth Success Messages
    verificationEmailSent: 'E-mail de vérification envoyé. Veuillez vérifier votre boîte de réception.',
    profileUpdateSuccess: 'Profil mis à jour avec succès.',
    emailUpdateSuccess: 'E-mail mis à jour avec succès. Veuillez vérifier votre nouvel e-mail.',
    passwordUpdateSuccess: 'Mot de passe mis à jour avec succès.',
    recentLoginRequired: 'Veuillez vous reconnecter pour continuer cette action.',

    // Auth Additional
    emailVerification: 'Vérification d\'E-mail',
    resendVerification: 'Renvoyer l\'E-mail de Vérification',
    updateProfile: 'Mettre à Jour le Profil',
    updateEmail: 'Mettre à Jour l\'E-mail',
    updatePassword: 'Mettre à Jour le Mot de Passe',
    currentPassword: 'Mot de Passe Actuel',
    newPassword: 'Nouveau Mot de Passe',
    verifyEmail: 'Veuillez vérifier votre e-mail',

    // Network and Server Errors
    noInternetConnection: 'Pas de connexion Internet. Veuillez vérifier votre réseau.',
    serverError: 'Le serveur est actuellement indisponible. Veuillez réessayer plus tard.',
    networkError: 'Erreur réseau. Veuillez vérifier votre connexion.',
    tooManyRequests: 'Trop de tentatives. Veuillez réessayer plus tard.',
    operationNotAllowed: 'Cette opération n\'est pas autorisée.',
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
    
    // Form Validation
    emailRequired: 'E-Mail ist erforderlich',
    passwordRequired: 'Passwort ist erforderlich',
    fullNameRequired: 'Vollständiger Name ist erforderlich',
    invalidEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
    passwordTooShort: 'Das Passwort muss mindestens 6 Zeichen lang sein',
    
    // Auth Errors
    error: 'Fehler',
    loginError: 'Anmeldung fehlgeschlagen',
    userNotFound: 'Kein Benutzer mit dieser E-Mail gefunden',
    wrongPassword: 'Falsches Passwort',
    
    // Auth UI
    or: 'ODER',
    dontHaveAccount: 'Noch kein Konto? Registrieren',

    // Signup Validation & Errors
    passwordsDoNotMatch: 'Passwörter stimmen nicht überein',
    signupError: 'Konto konnte nicht erstellt werden',
    emailAlreadyInUse: 'Diese E-Mail ist bereits registriert',
    weakPassword: 'Das Passwort ist zu schwach',
    alreadyHaveAccount: 'Bereits ein Konto? Anmelden',

    // Reset Password
    resetPassword: 'Passwort zurücksetzen',
    resetPasswordInstructions: 'Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen Anweisungen zum Zurücksetzen Ihres Passworts.',
    resetPasswordEmailSent: 'E-Mail zum Zurücksetzen gesendet. Bitte überprüfen Sie Ihren Posteingang.',
    resetPasswordError: 'E-Mail konnte nicht gesendet werden',
    sendResetLink: 'Link senden',
    backToLogin: 'Zurück zum Login',
    success: 'Erfolg',
    ok: 'OK',

    // Auth Success Messages
    verificationEmailSent: 'Bestätigungs-E-Mail gesendet. Bitte überprüfen Sie Ihren Posteingang.',
    profileUpdateSuccess: 'Profil erfolgreich aktualisiert.',
    emailUpdateSuccess: 'E-Mail erfolgreich aktualisiert. Bitte bestätigen Sie Ihre neue E-Mail.',
    passwordUpdateSuccess: 'Passwort erfolgreich aktualisiert.',
    recentLoginRequired: 'Bitte melden Sie sich erneut an, um diese Aktion fortzusetzen.',

    // Auth Additional
    emailVerification: 'E-Mail-Verifizierung',
    resendVerification: 'Bestätigungs-E-Mail erneut senden',
    updateProfile: 'Profil aktualisieren',
    updateEmail: 'E-Mail aktualisieren',
    updatePassword: 'Passwort aktualisieren',
    currentPassword: 'Aktuelles Passwort',
    newPassword: 'Neues Passwort',
    verifyEmail: 'Bitte bestätigen Sie Ihre E-Mail',

    // Network and Server Errors
    noInternetConnection: 'Keine Internetverbindung. Bitte überprüfen Sie Ihr Netzwerk.',
    serverError: 'Server ist derzeit nicht verfügbar. Bitte versuchen Sie es später erneut.',
    networkError: 'Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung.',
    tooManyRequests: 'Zu viele Versuche. Bitte versuchen Sie es später erneut.',
    operationNotAllowed: 'Diese Operation ist nicht erlaubt.',
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
    
    // Form Validation
    emailRequired: '请输入邮箱',
    passwordRequired: '请输入密码',
    fullNameRequired: '请输入全名',
    invalidEmail: '请输入有效的邮箱地址',
    passwordTooShort: '密码至少需要6个字符',
    
    // Auth Errors
    error: '错误',
    loginError: '登录失败',
    userNotFound: '未找到该邮箱对应的用户',
    wrongPassword: '密码错误',
    
    // Auth UI
    or: '或',
    dontHaveAccount: '没有账号？注册',

    // Signup Validation & Errors
    passwordsDoNotMatch: '密码不匹配',
    signupError: '创建账号失败',
    emailAlreadyInUse: '该邮箱已被注册',
    weakPassword: '密码强度太弱',
    alreadyHaveAccount: '已有账号？登录',

    // Reset Password
    resetPassword: '重置密码',
    resetPasswordInstructions: '输入您的邮箱地址，我们将向您发送重置密码的说明。',
    resetPasswordEmailSent: '重置密码邮件已发送。请检查您的收件箱。',
    resetPasswordError: '发送邮件失败',
    sendResetLink: '发送重置链接',
    backToLogin: '返回登录',
    success: '成功',
    ok: '确定',

    // Auth Success Messages
    verificationEmailSent: '验证邮件已发送。请检查您的收件箱。',
    profileUpdateSuccess: '个人资料更新成功。',
    emailUpdateSuccess: '邮箱更新成功。请验证您的新邮箱。',
    passwordUpdateSuccess: '密码更新成功。',
    recentLoginRequired: '请重新登录以继续此操作。',

    // Auth Additional
    emailVerification: '邮箱验证',
    resendVerification: '重新发送验证邮件',
    updateProfile: '更新个人资料',
    updateEmail: '更新邮箱',
    updatePassword: '更新密码',
    currentPassword: '当前密码',
    newPassword: '新密码',
    verifyEmail: '请验证您的邮箱',

    // Network and Server Errors
    noInternetConnection: '无网络连接。请检查您的网络。',
    serverError: '服务器当前不可用。请稍后重试。',
    networkError: '网络错误。请检查您的连接。',
    tooManyRequests: '尝试次数过多。请稍后重试。',
    operationNotAllowed: '此操作不被允许。',
  },
};

type TranslationKeys = keyof typeof translations.en;

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKeys) => string;
};

// Configure i18n
I18n.fallbacks = true;
I18n.translations = translations;
I18n.defaultLocale = 'en';

// Try to detect the user's locale
const getInitialLocale = (): Language => {
  const locale = Localization.locale.split('-')[0];
  return (locale in languages ? locale : 'en') as Language;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(getInitialLocale());

  useEffect(() => {
    I18n.locale = language;
  }, [language]);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  const translate = (key: TranslationKeys): string => {
    return I18n.t(key);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: changeLanguage,
        t: translate,
      }}
    >
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