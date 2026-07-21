import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    age: '',
    sexe: '',
    adresse: '',
    telephone: '',
    travail: '',
    salaireMensuel: '',
    accepteConfidentialite: false
  });

  const [identityFile, setIdentityFile] = useState(null);
  const [identityPreview, setIdentityPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setErrors(prev => ({ ...prev, identityFile: 'Format non autorisé. Utilisez JPG, PNG ou PDF.' }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, identityFile: 'Fichier trop volumineux (max 10 Mo).' }));
      return;
    }

    setIdentityFile(file);
    setErrors(prev => ({ ...prev, identityFile: '' }));

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setIdentityPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setIdentityPreview('pdf');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom.trim()) newErrors.nom = 'Le nom de famille est requis.';
    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis.';
    if (!formData.age || formData.age < 18 || formData.age > 100) {
      newErrors.age = "L'âge doit être compris entre 18 et 100 ans.";
    }
    if (!formData.sexe) newErrors.sexe = 'Veuillez sélectionner votre sexe.';
    if (!formData.adresse.trim()) newErrors.adresse = "L'adresse est requise.";
    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Le numéro de téléphone est requis.';
    } else if (!/^\+?[\d\s\-()]{6,20}$/.test(formData.telephone)) {
      newErrors.telephone = 'Format de numéro invalide.';
    }
    if (!formData.travail.trim()) newErrors.travail = 'Le travail est requis.';
    if (!formData.salaireMensuel || Number(formData.salaireMensuel) <= 0) {
      newErrors.salaireMensuel = 'Le salaire mensuel doit être supérieur à 0.';
    }
    if (!identityFile) newErrors.identityFile = 'Veuillez importer votre pièce d\'identité.';
    if (!formData.accepteConfidentialite) {
      newErrors.accepteConfidentialite = 'Vous devez accepter la clause de confidentialité.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmitStatus({ type: 'error', message: 'Veuillez corriger les erreurs dans le formulaire.' });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const data = new FormData();
      data.append('nom', formData.nom);
      data.append('prenom', formData.prenom);
      data.append('age', formData.age);
      data.append('sexe', formData.sexe);
      data.append('adresse', formData.adresse);
      data.append('telephone', formData.telephone);
      data.append('travail', formData.travail);
      data.append('salaireMensuel', formData.salaireMensuel);
      data.append('accepteConfidentialite', formData.accepteConfidentialite);
      data.append('identityDocument', identityFile);

      const response = await fetch('http://localhost:5000/api/submit-application', {
        method: 'POST',
        body: data
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus({
          type: 'success',
          message: 'Votre demande a été envoyée avec succès ! Nous vous contacterons très prochainement.'
        });
        // Réinitialiser le formulaire
        setFormData({
          nom: '', prenom: '', age: '', sexe: '', adresse: '',
          telephone: '', travail: '', salaireMensuel: '', accepteConfidentialite: false
        });
        setIdentityFile(null);
        setIdentityPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setSubmitStatus({ type: 'error', message: result.message || 'Une erreur est survenue.' });
      }
    } catch (err) {
      setSubmitStatus({
        type: 'error',
        message: 'Impossible de contacter le serveur. Vérifiez que le backend est démarré.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>FinanzPlus Austria</h1>
          <p className="subtitle">Formulaire de demande — Kreditwürdigkeitsformular</p>
        </header>

        <form onSubmit={handleSubmit} className="form">

          {/* SECTION 1 : INFORMATIONS PERSONNELLES */}
          <section className="form-section">
            <h2 className="section-title">📋 Informations personnelles</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nom">Nom de famille *</label>
                <input type="text" id="nom" name="nom" value={formData.nom}
                  onChange={handleInputChange} className={errors.nom ? 'error' : ''}
                  placeholder="Votre nom de famille" />
                {errors.nom && <span className="error-message">{errors.nom}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="prenom">Prénom *</label>
                <input type="text" id="prenom" name="prenom" value={formData.prenom}
                  onChange={handleInputChange} className={errors.prenom ? 'error' : ''}
                  placeholder="Votre prénom" />
                {errors.prenom && <span className="error-message">{errors.prenom}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="age">Âge *</label>
                <input type="number" id="age" name="age" value={formData.age}
                  onChange={handleInputChange} className={errors.age ? 'error' : ''}
                  placeholder="Votre âge" min="18" max="100" />
                {errors.age && <span className="error-message">{errors.age}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="sexe">Sexe *</label>
                <select id="sexe" name="sexe" value={formData.sexe}
                  onChange={handleInputChange} className={`select-input${errors.sexe ? ' error' : ''}`}>
                  <option value="">-- Sélectionnez --</option>
                  <option value="Homme">Homme</option>
                  <option value="Femme">Femme</option>
                  <option value="Autre">Autre</option>
                </select>
                {errors.sexe && <span className="error-message">{errors.sexe}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="adresse">Adresse complète *</label>
              <textarea id="adresse" name="adresse" value={formData.adresse}
                onChange={handleInputChange} className={errors.adresse ? 'error' : ''}
                placeholder="Rue, numéro, code postal, ville, pays" rows="3" />
              {errors.adresse && <span className="error-message">{errors.adresse}</span>}
            </div>
          </section>

          {/* SECTION 2 : CONTACT */}
          <section className="form-section">
            <h2 className="section-title">📞 Coordonnées</h2>
            <div className="form-group">
              <label htmlFor="telephone">Numéro de téléphone *</label>
              <input type="tel" id="telephone" name="telephone" value={formData.telephone}
                onChange={handleInputChange} className={errors.telephone ? 'error' : ''}
                placeholder="+43 XXX XXX XXXX" />
              {errors.telephone && <span className="error-message">{errors.telephone}</span>}
            </div>
          </section>

          {/* SECTION 3 : INFORMATIONS PROFESSIONNELLES */}
          <section className="form-section">
            <h2 className="section-title">💼 Informations professionnelles</h2>

            <div className="form-group">
              <label htmlFor="travail">Profession / Travail *</label>
              <input type="text" id="travail" name="travail" value={formData.travail}
                onChange={handleInputChange} className={errors.travail ? 'error' : ''}
                placeholder="Votre profession" />
              {errors.travail && <span className="error-message">{errors.travail}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="salaireMensuel">Salaire mensuel (€) *</label>
              <input type="number" id="salaireMensuel" name="salaireMensuel"
                value={formData.salaireMensuel} onChange={handleInputChange}
                className={errors.salaireMensuel ? 'error' : ''}
                placeholder="Votre salaire mensuel en euros" min="0" step="0.01" />
              {errors.salaireMensuel && <span className="error-message">{errors.salaireMensuel}</span>}
            </div>
          </section>

          {/* SECTION 4 : PIÈCE D'IDENTITÉ */}
          <section className="form-section">
            <h2 className="section-title">🪪 Pièce d'identité</h2>
            <p className="section-desc">
              Importez votre carte d'identité, passeport ou tout document officiel prouvant votre identité.
            </p>

            <div className="form-group">
              <label htmlFor="identityDocument">Document d'identité * <span className="file-hint">(JPG, PNG ou PDF — max 10 Mo)</span></label>
              <div className={`file-drop-zone${identityFile ? ' has-file' : ''}${errors.identityFile ? ' error-border' : ''}`}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}>
                {!identityFile ? (
                  <>
                    <div className="file-drop-icon">📎</div>
                    <p className="file-drop-text">Cliquez pour sélectionner votre fichier</p>
                    <p className="file-drop-sub">JPG · PNG · PDF</p>
                  </>
                ) : (
                  <div className="file-selected">
                    {identityPreview && identityPreview !== 'pdf' ? (
                      <img src={identityPreview} alt="Aperçu pièce d'identité" className="id-preview-img" />
                    ) : (
                      <div className="pdf-preview">📄 {identityFile.name}</div>
                    )}
                    <p className="file-name-label">{identityFile.name}</p>
                    <button type="button" className="remove-file-btn"
                      onClick={(e) => { e.stopPropagation(); setIdentityFile(null); setIdentityPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}>
                      ✕ Supprimer
                    </button>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" id="identityDocument" name="identityDocument"
                accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} style={{ display: 'none' }} />
              {errors.identityFile && <span className="error-message">{errors.identityFile}</span>}
            </div>
          </section>

          {/* SECTION 5 : CLAUSE DE CONFIDENTIALITÉ */}
          <section className="form-section confidentiality-section">
            <h2 className="section-title">🔒 Clause de confidentialité</h2>
            <div className="confidentiality-box">
              <h3>Accord de confidentialité — FinanzPlus Austria &amp; le Demandeur</h3>
              <p>
                Les informations personnelles collectées dans ce formulaire (nom, prénom, âge, sexe, adresse,
                numéro de téléphone, profession, salaire mensuel et pièce d'identité) sont destinées
                <strong> exclusivement à FinanzPlus Austria</strong> dans le cadre de l'évaluation de votre
                demande de crédit.
              </p>
              <p>
                FinanzPlus Austria s'engage à :
              </p>
              <ul>
                <li>Ne jamais divulguer vos données personnelles à des tiers non autorisés.</li>
                <li>Utiliser vos informations uniquement dans le cadre de votre dossier de crédit.</li>
                <li>Protéger et sécuriser l'ensemble de vos documents transmis.</li>
                <li>Respecter les lois en vigueur sur la protection des données personnelles (RGPD).</li>
                <li>Détruire vos données sur simple demande de votre part, dès que le dossier est clôturé.</li>
              </ul>
              <p>
                En cochant la case ci-dessous, vous confirmez avoir lu, compris et accepté l'intégralité de
                cet accord de confidentialité entre vous et FinanzPlus Austria.
              </p>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input type="checkbox" name="accepteConfidentialite"
                  checked={formData.accepteConfidentialite} onChange={handleInputChange}
                  className={errors.accepteConfidentialite ? 'error' : ''} />
                <span>J'ai lu et j'accepte la clause de confidentialité entre moi et FinanzPlus Austria. *</span>
              </label>
              {errors.accepteConfidentialite && <span className="error-message">{errors.accepteConfidentialite}</span>}
            </div>
          </section>

          {/* Message de statut */}
          {submitStatus && (
            <div className={`status-message ${submitStatus.type}`}>
              {submitStatus.message}
            </div>
          )}

          {/* SECTION 6 : ENVOI */}
          <section className="form-section submit-section">
            <button type="submit" className="submit-button"
              disabled={!formData.accepteConfidentialite || isSubmitting}>
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma demande'}
            </button>
            <p className="submit-note">* Champs obligatoires</p>
          </section>

        </form>

        <footer className="footer">
          <p>© 2026 FinanzPlus Austria — Tous droits réservés</p>
        </footer>
      </div>
    </div>
  );
}

export default App;

// Made with Bob
