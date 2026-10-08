// Error translation helper — standalone, no React dependency
// Uses localStorage to detect current language

const errorMap = {
  'Email ou mot de passe incorrect':              { fr: 'Email ou mot de passe incorrect',              ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة', en: 'Incorrect email or password' },
  'Votre compte a été banni':                     { fr: 'Votre compte a été banni',                     ar: 'تم حظر حسابك', en: 'Your account has been banned' },
  'Votre compte est suspendu':                    { fr: 'Votre compte est suspendu',                    ar: 'حسابك موقوف', en: 'Your account is suspended' },
  'Votre compte est en attente de validation':    { fr: 'Votre compte est en attente de validation',    ar: 'حسابك قيد انتظار المصادقة', en: 'Your account is pending validation' },
  'Token invalide':                                { fr: 'Token invalide',                                ar: 'رمز غير صالح', en: 'Invalid token' },
  'Token expiré':                                  { fr: 'Token expiré',                                  ar: 'الرمز منتهي الصلاحية', en: 'Expired token' },
  'Token invalide ou expiré':                     { fr: 'Token invalide ou expiré',                     ar: 'الرمز غير صالح أو منتهي الصلاحية', en: 'Invalid or expired token' },
  'Code invalide ou expiré':                       { fr: 'Code invalide ou expiré',                       ar: 'الرمز غير صالح أو منتهي الصلاحية', en: 'Invalid or expired code' },
  'Utilisateur non trouvé':                        { fr: 'Utilisateur non trouvé',                        ar: 'المستخدم غير موجود', en: 'User not found' },
  'Membre non trouvé':                             { fr: 'Membre non trouvé',                             ar: 'العضو غير موجود', en: 'Member not found' },
  'Erreur de connexion':                           { fr: 'Erreur de connexion',                           ar: 'خطأ في الاتصال', en: 'Connection error' },
  'Erreur lors de l\'inscription':                 { fr: 'Erreur lors de l\'inscription',                 ar: 'خطأ أثناء التسجيل', en: 'Registration error' },
  'Erreur de vérification':                        { fr: 'Erreur de vérification',                        ar: 'خطأ في التحقق', en: 'Verification error' },
  'Accès non autorisé':                            { fr: 'Accès non autorisé',                            ar: 'وصول غير مصرح به', en: 'Unauthorized access' },
  'Accès non autorisé. Token manquant.':           { fr: 'Accès non autorisé. Token manquant.',           ar: 'وصول غير مصرح به. الرمز مفقود.', en: 'Unauthorized access. Missing token.' },
  'Session expirée':                                 { fr: 'Session expirée',                                 ar: 'انتهت الجلسة', en: 'Session expired' },
  'Veuillez fournir un email valide':              { fr: 'Veuillez fournir un email valide',              ar: 'يرجى تقديم بريد إلكتروني صالح', en: 'Please provide a valid email' },
  'Cet email est déjà utilisé':                    { fr: 'Cet email est déjà utilisé',                    ar: 'هذا البريد الإلكتروني مستخدم بالفعل', en: 'This email is already used' },
  'Les mots de passe ne correspondent pas':        { fr: 'Les mots de passe ne correspondent pas',        ar: 'كلمات المرور غير متطابقة', en: 'Passwords do not match' },
  'Paramètres manquants':                          { fr: 'Paramètres manquants',                          ar: 'معلمات مفقودة', en: 'Missing parameters' },
  'Action invalide':                                { fr: 'Action invalide',                                ar: 'إجراء غير صالح', en: 'Invalid action' },
  'Seul l\'administrateur peut valider les inscriptions': { fr: 'Seul l\'administrateur peut valider les inscriptions', ar: 'فقط المسؤول يمكنه المصادقة على التسجيلات', en: 'Only the administrator can validate registrations' },
  'Seul l\'administrateur peut modifier les rôles': { fr: 'Seul l\'administrateur peut modifier les rôles', ar: 'فقط المسؤول يمكنه تعديل الأدوار', en: 'Only the administrator can modify roles' },
  'Seul l\'administrateur peut modifier le statut': { fr: 'Seul l\'administrateur peut modifier le statut', ar: 'فقط المسؤول يمكنه تعديل الحالة', en: 'Only the administrator can modify status' },
  'Seul le président peut approuver':              { fr: 'Seul le président peut approuver',              ar: 'فقط الرئيس يمكنه الموافقة', en: 'Only the president can approve' },
  'Seul le président peut rejeter':               { fr: 'Seul le président peut rejeter',               ar: 'فقط الرئيس يمكنه الرفض', en: 'Only the president can reject' },
  'Ce membre est déjà banni':                      { fr: 'Ce membre est déjà banni',                      ar: 'هذا العضو محظور بالفعل', en: 'This member is already banned' },
  'Ce membre n\'est pas en attente de validation': { fr: 'Ce membre n\'est pas en attente de validation', ar: 'هذا العضو ليس قيد انتظار المصادقة', en: 'This member is not pending validation' },
  'Ce membre n\'est pas suspendu ou banni':        { fr: 'Ce membre n\'est pas suspendu ou banni',        ar: 'هذا العضو ليس موقوفًا أو محظورًا', en: 'This member is not suspended or banned' },
  'Ce numéro de téléphone est déjà utilisé':       { fr: 'Ce numéro de téléphone est déjà utilisé',       ar: 'رقم الهاتف هذا مستخدم بالفعل', en: 'This phone number is already used' },
  'Tâche non trouvée':                             { fr: 'Tâche non trouvée',                             ar: 'المهمة غير موجودة', en: 'Task not found' },
  'Membre assigné non trouvé':                     { fr: 'Membre assigné non trouvé',                     ar: 'العضو المعين غير موجود', en: 'Assigned member not found' },
  'Événement non trouvé':                          { fr: 'Événement non trouvé',                          ar: 'الفعالية غير موجودة', en: 'Event not found' },
  'Actualité non trouvée':                         { fr: 'Actualité non trouvée',                         ar: 'الخبر غير موجود', en: 'News not found' },
  'Publication non trouvée':                       { fr: 'Publication non trouvée',                       ar: 'المنشور غير موجود', en: 'Publication not found' },
  'Document non trouvé':                           { fr: 'Document non trouvé',                           ar: 'المستند غير موجود', en: 'Document not found' },
  'Fichier non trouvé':                            { fr: 'Fichier non trouvé',                            ar: 'الملف غير موجود', en: 'File not found' },
  'Entretien non trouvé':                          { fr: 'Entretien non trouvé',                          ar: 'المقابلة غير موجودة', en: 'Interview not found' },
  'Message non trouvé':                            { fr: 'Message non trouvé',                            ar: 'الرسالة غير موجودة', en: 'Message not found' },
  'ID invalide':                                    { fr: 'ID invalide',                                    ar: 'معرف غير صالح', en: 'Invalid ID' },
  'Date requise':                                   { fr: 'Date requise',                                   ar: 'التاريخ مطلوب', en: 'Date required' },
  'La date doit être dans le futur':               { fr: 'La date doit être dans le futur',               ar: 'يجب أن يكون التاريخ في المستقبل', en: 'Date must be in the future' },
  'Vous avez déjà une demande en cours':           { fr: 'Vous avez déjà une demande en cours',           ar: 'لديك طلب قيد المعالجة بالفعل', en: 'You already have a pending request' },
  'Entretien ne peut pas être approuvé':           { fr: 'Entretien ne peut pas être approuvé',           ar: 'لا يمكن الموافقة على هذه المقابلة', en: 'Interview cannot be approved' },
  'Entretien ne peut pas être rejeté':             { fr: 'Entretien ne peut pas être rejeté',             ar: 'لا يمكن رفض هذه المقابلة', en: 'Interview cannot be rejected' },
  'Entretien doit être approuvé avant d\'être réalisé': { fr: 'Entretien doit être approuvé avant d\'être réalisé', ar: 'يجب الموافقة على المقابلة قبل تنفيذها', en: 'Interview must be approved before being completed' },
  'Entretien ne peut plus être modifié':           { fr: 'Entretien ne peut plus être modifié',           ar: 'لا يمكن تعديل هذه المقابلة بعد الآن', en: 'Interview can no longer be modified' },
  'Token déjà utilisé ou invalide':                { fr: 'Token déjà utilisé ou invalide',                ar: 'الرمز مستخدم بالفعل أو غير صالح', en: 'Token already used or invalid' },
  'Token invalide pour ce membre':                 { fr: 'Token invalide pour ce membre',                 ar: 'الرمز غير صالح لهذا العضو', en: 'Invalid token for this member' },
  'Ce membre a déjà été traité':                   { fr: 'Ce membre a déjà été traité',                   ar: 'تمت معالجة هذا العضو مسبقًا', en: 'This member has already been processed' },
  'La date d\'entretien est obligatoire':          { fr: 'La date d\'entretien est obligatoire',          ar: 'تاريخ المقابلة إلزامي', en: 'Interview date is required' },
  'Un entretien est déjà programmé à cette heure.': { fr: 'Un entretien est déjà programmé à cette heure.', ar: 'مقابلة مبرمجة بالفعل في هذا الوقت.', en: 'An interview is already scheduled at this time.' },
  'Statut invalide':                                { fr: 'Statut invalide',                                ar: 'حالة غير صالحة', en: 'Invalid status' },
  'Erreur':                                         { fr: 'Erreur',                                         ar: 'خطأ', en: 'Error' },
  'Erreur lors de l\'envoi du code':               { fr: 'Erreur lors de l\'envoi du code',               ar: 'خطأ في إرسال الرمز', en: 'Error sending code' },
  'Erreur lors de la réinitialisation':            { fr: 'Erreur lors de la réinitialisation',            ar: 'خطأ في إعادة التعيين', en: 'Error resetting password' },
  'Route non trouvée':                              { fr: 'Route non trouvée',                              ar: 'المسار غير موجود', en: 'Route not found' },
  'Ce rôle est déjà attribué à un autre membre. Veuillez d\'abord le retirer avant de l\'attribuer à une nouvelle personne.':
    { fr: 'Ce rôle est déjà attribué à un autre membre.', ar: 'هذا الدور مُسند لعضو آخر بالفعل.', en: 'This role is already assigned to another member.' },
  'Le mandat de VPFD est expiré. Un autre membre occupe déjà ce poste.':
    { fr: 'Le mandat VPFD est expiré et déjà attribué.', ar: 'انتهت ولاية VPFD وتم تعيين عضو آخر.', en: 'The VPFD mandate has expired and is already assigned.' },
  'Le mandat de VPPRE est expiré. Un autre membre occupe déjà ce poste.':
    { fr: 'Le mandat VPPRE est expiré et déjà attribué.', ar: 'انتهت ولاية VPPRE وتم تعيين عضو آخر.', en: 'The VPPRE mandate has expired and is already assigned.' },
  'Le mandat de Tresorie est expiré. Un autre membre occupe déjà ce poste.':
    { fr: 'Le mandat Trésorerie est expiré et déjà attribué.', ar: 'انتهت ولاية الخزينة وتم تعيين عضو آخر.', en: 'The Treasurer mandate has expired and is already assigned.' },
  'Connexion au serveur impossible. Vérifiez votre connexion internet.':
    { fr: 'Connexion au serveur impossible. Vérifiez votre connexion internet.', ar: 'تعذر الاتصال بالخادم. تحقق من اتصالك بالإنترنت.', en: 'Unable to connect to server. Check your internet connection.' },
  'Veuillez fournir email et mot de passe':
    { fr: 'Veuillez fournir votre email et mot de passe.', ar: 'يرجى تقديم بريدك الإلكتروني وكلمة المرور.', en: 'Please provide your email and password.' },
  'Tous les champs obligatoires doivent être remplis':
    { fr: 'Veuillez remplir tous les champs obligatoires.', ar: 'يرجى ملء جميع الحقول الإلزامية.', en: 'Please fill in all required fields.' },
  'Inscription réussie ! Veuillez vérifier votre email.':
    { fr: 'Inscription réussie ! Veuillez vérifier votre email.', ar: 'تم التسجيل بنجاح! يرجى التحقق من بريدك الإلكتروني.', en: 'Registration successful! Please check your email.' },
  'Connexion réussie':
    { fr: 'Connexion réussie', ar: 'تم تسجيل الدخول بنجاح', en: 'Login successful' },
  'Email vérifié avec succès':
    { fr: 'Email vérifié avec succès', ar: 'تم التحقق من البريد الإلكتروني بنجاح', en: 'Email verified successfully' },
};

export const getLang = () => localStorage.getItem('jci_lang') || 'fr';

export const translateErrorMessage = (message) => {
  if (!message || typeof message !== 'string') return message;
  const lang = getLang();
  if (lang === 'fr') return message;
  const entry = errorMap[message];
  if (!entry) return message;
  if (lang === 'en') return entry.en || message;
  return entry.ar || message;
};

export const getErrorMessage = (error, fallback = 'Erreur') => {
  if (!error) return translateErrorMessage(fallback);
  const msg = error.translatedMessage || error.response?.data?.message || error.message || fallback;
  return translateErrorMessage(msg);
};
