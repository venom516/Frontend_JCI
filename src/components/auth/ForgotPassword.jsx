import React, { useState } from "react";
import { authAPI } from "../../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { useI18n } from "../../contexts/I18nContext";
const StepIndicator = ({ current, steps }) => (
  <div className="flex items-center justify-center gap-2 mb-6">
    {steps.map((s, i) => (
      <React.Fragment key={i}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
          i + 1 <= current
            ? "bg-primary-600 text-white shadow-soft"
            : "bg-surface-100 text-surface-400"
        }`}>
          {i + 1}
        </div>
        {i < steps.length - 1 && (
          <div className={`h-0.5 w-8 transition-all duration-300 ${i + 1 < current ? "bg-primary-600" : "bg-surface-200"}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

const ForgotPassword = () => {
  const { t, translateError } = useI18n();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    setLoading(true);
    try {
      const res = await authAPI.forgotPassword({ email });
      setMessage(translateError(res.data.message));
      setStep(2);
    } catch (err) {
      setError(translateError(err.response?.data?.message || t("forgot.error_envoi")));
    } finally { setLoading(false); }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    setLoading(true);
    try {
      const res = await authAPI.verifyResetCode({ email, code });
      setMessage(translateError(res.data.message));
      setStep(3);
    } catch (err) {
      setError(translateError(err.response?.data?.message || t("forgot.error_code")));
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    if (newPassword !== confirmPassword) {
      setError(t("forgot.error_mdp_correspondance"));
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.resetPassword({ email, code, newPassword, confirmPassword });
      setMessage(translateError(res.data.message));
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(translateError(err.response?.data?.message || t("forgot.error_reset")));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="flex min-h-[calc(100vh-64px)]">
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 via-primary-700 to-surface-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-300 rounded-full blur-3xl" />
        </div>
        <div className="relative text-center max-w-md">
          <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-xl flex items-center justify-center mx-auto mb-6 ring-1 ring-white/20">
            <span className="text-5xl font-bold text-white font-display">JCI</span>
          </div>
          <h2 className="text-3xl font-bold text-white font-display mb-4">{t("forgot.hero_titre")}</h2>
          <p className="text-white/70 text-lg leading-relaxed">
            {t("forgot.hero_texte")}
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mx-auto mb-4 shadow-soft-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-surface-900 font-display">{t("forgot.titre")}</h1>
            <p className="text-surface-500 mt-1">
              {step === 1 && t("forgot.step1_desc")}
              {step === 2 && t("forgot.step2_desc")}
              {step === 3 && t("forgot.step3_desc")}
            </p>
          </div>

          <div className="card">
            <StepIndicator current={step} steps={[t("forgot.step_email"), t("forgot.step_code"), t("forgot.step_new_password")]} />

            {error && (
              <div className="flex items-center gap-2 bg-rose-50 text-rose-700 px-4 py-3 rounded-xl text-sm ring-1 ring-rose-200 mb-4">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                <span>{error}</span>
              </div>
            )}
            {message && (
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-sm ring-1 ring-emerald-200 mb-4">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                <span>{message}</span>
              </div>
            )}

            {step === 1 && (
              <form onSubmit={handleSendCode} className="space-y-5">
                <p className="text-sm text-surface-500">{t("forgot.step1_instruction")}</p>
                <div>
                  <label className="input-label">{t("forgot.email_label")}</label>
                  <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder={t("forgot.email_placeholder")} />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading && <svg className="animate-spin -ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>}
                  {loading ? t("forgot.envoyer_cours") : t("forgot.envoyer_code")}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyCode} className="space-y-5">
                <p className="text-sm text-surface-500">{t("forgot.step2_instruction")}</p>
                <div>
                  <label className="input-label">{t("forgot.code_label")}</label>
                  <input type="text" className="input-field text-center text-2xl tracking-[0.5em] font-mono"
                    value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} required placeholder={t("forgot.code_placeholder")} />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading && <svg className="animate-spin -ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>}
                  {loading ? t("forgot.verifier_cours") : t("forgot.verifier_code")}
                </button>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <p className="text-sm text-surface-500">{t("forgot.step3_instruction")}</p>
                <div>
                  <label className="input-label">{t("forgot.new_password_label")}</label>
                  <input type="password" className="input-field" value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)} minLength={6} required placeholder={t("forgot.new_password_placeholder")} />
                </div>
                <div>
                  <label className="input-label">{t("forgot.confirm_password_label")}</label>
                  <input type="password" className="input-field" value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)} minLength={6} required placeholder={t("forgot.confirm_password_placeholder")} />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading && <svg className="animate-spin -ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>}
                  {loading ? t("forgot.reset_cours") : t("forgot.reset_mdp")}
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link to="/login" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                {t("forgot.retour_connexion")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ForgotPassword;