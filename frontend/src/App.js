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
      setErrors(prev => ({ ...prev, identityFile: 'Nicht erlaubtes Format. Bitte JPG, PNG oder PDF verwenden.' }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, identityFile: 'Datei zu groß (max. 10 MB).' }));
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

    if (!formData.nom.trim()) newErrors.nom = 'Nachname ist erforderlich.';
    if (!formData.prenom.trim()) newErrors.prenom = 'Vorname ist erforderlich.';
    if (!formData.age || formData.age < 18 || formData.age > 100) {
      newErrors.age = 'Das Alter muss zwischen 18 und 100 Jahren liegen.';
    }
    if (!formData.sexe) newErrors.sexe = 'Bitte wählen Sie Ihr Geschlecht aus.';
    if (!formData.adresse.trim()) newErrors.adresse = 'Adresse ist erforderlich.';
    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Telefonnummer ist erforderlich.';
    } else if (!/^\+?[\d\s\-()]{6,20}$/.test(formData.telephone)) {
      newErrors.telephone = 'Ungültiges Telefonnummernformat.';
    }
    if (!formData.travail.trim()) newErrors.travail = 'Beruf ist erforderlich.';
    if (!formData.salaireMensuel || Number(formData.salaireMensuel) <= 0) {
      newErrors.salaireMensuel = 'Das monatliche Gehalt muss größer als 0 sein.';
    }
    if (!identityFile) newErrors.identityFile = 'Bitte laden Sie Ihren Lichtbildausweis hoch.';
    if (!formData.accepteConfidentialite) {
      newErrors.accepteConfidentialite = 'Sie müssen die Vertraulichkeitsklausel akzeptieren.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmitStatus({ type: 'error', message: 'Bitte korrigieren Sie die Fehler im Formular.' });
      return;
    }

    const subject = encodeURIComponent(`Kreditantrag FinanzPlus Austria — ${formData.prenom} ${formData.nom}`);

    const body = encodeURIComponent(
`KREDITANTRAG — FINANZPLUS AUSTRIA
=====================================

PERSÖNLICHE INFORMATIONEN
--------------------------
Nachname:             ${formData.nom}
Vorname:              ${formData.prenom}
Alter:                ${formData.age} Jahre
Geschlecht:           ${formData.sexe}
Adresse:              ${formData.adresse}

KONTAKTDATEN
------------
Telefonnummer:        ${formData.telephone}

BERUFLICHE INFORMATIONEN
------------------------
Beruf:                ${formData.travail}
Monatliches Gehalt:   ${formData.salaireMensuel} €

AUSWEISDOKUMENT
---------------
⚠️ Bitte fügen Sie Ihr Ausweisdokument (${identityFile ? identityFile.name : 'Datei'}) als Anhang hinzu, bevor Sie senden.

VERTRAULICHKEIT
---------------
✓ Der Antragsteller hat die Vertraulichkeitsvereinbarung gelesen und akzeptiert.

=====================================
Einreichungsdatum: ${new Date().toLocaleString('de-DE')}`
    );

    window.location.href = `mailto:kontakt_finanzplusaustria@proton.me?subject=${subject}&body=${body}`;

    setSubmitStatus({
      type: 'success',
      message: 'Ihr E-Mail-Programm wurde geöffnet. Bitte vergessen Sie nicht, Ihr Ausweisdokument als Anhang hinzuzufügen, bevor Sie senden!'
    });
  };

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>FinanzPlus Austria</h1>
          <p className="subtitle">Kreditwürdigkeitsformular</p>
        </header>

        <form onSubmit={handleSubmit} className="form">

          {/* ABSCHNITT 1: PERSÖNLICHE INFORMATIONEN */}
          <section className="form-section">
            <h2 className="section-title">📋 Persönliche Informationen</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nom">Nachname *</label>
                <input type="text" id="nom" name="nom" value={formData.nom}
                  onChange={handleInputChange} className={errors.nom ? 'error' : ''}
                  placeholder="Ihr Nachname" />
                {errors.nom && <span className="error-message">{errors.nom}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="prenom">Vorname *</label>
                <input type="text" id="prenom" name="prenom" value={formData.prenom}
                  onChange={handleInputChange} className={errors.prenom ? 'error' : ''}
                  placeholder="Ihr Vorname" />
                {errors.prenom && <span className="error-message">{errors.prenom}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="age">Alter *</label>
                <input type="number" id="age" name="age" value={formData.age}
                  onChange={handleInputChange} className={errors.age ? 'error' : ''}
                  placeholder="Ihr Alter" min="18" max="100" />
                {errors.age && <span className="error-message">{errors.age}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="sexe">Geschlecht *</label>
                <select id="sexe" name="sexe" value={formData.sexe}
                  onChange={handleInputChange} className={`select-input${errors.sexe ? ' error' : ''}`}>
                  <option value="">-- Bitte wählen --</option>
                  <option value="Männlich">Männlich</option>
                  <option value="Weiblich">Weiblich</option>
                  <option value="Divers">Divers</option>
                </select>
                {errors.sexe && <span className="error-message">{errors.sexe}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="adresse">Vollständige Adresse *</label>
              <textarea id="adresse" name="adresse" value={formData.adresse}
                onChange={handleInputChange} className={errors.adresse ? 'error' : ''}
                placeholder="Straße, Hausnummer, Postleitzahl, Stadt, Land" rows="3" />
              {errors.adresse && <span className="error-message">{errors.adresse}</span>}
            </div>
          </section>

          {/* ABSCHNITT 2: KONTAKTDATEN */}
          <section className="form-section">
            <h2 className="section-title">📞 Kontaktdaten</h2>
            <div className="form-group">
              <label htmlFor="telephone">Telefonnummer *</label>
              <input type="tel" id="telephone" name="telephone" value={formData.telephone}
                onChange={handleInputChange} className={errors.telephone ? 'error' : ''}
                placeholder="+43 XXX XXX XXXX" />
              {errors.telephone && <span className="error-message">{errors.telephone}</span>}
            </div>
          </section>

          {/* ABSCHNITT 3: BERUFLICHE INFORMATIONEN */}
          <section className="form-section">
            <h2 className="section-title">💼 Berufliche Informationen</h2>

            <div className="form-group">
              <label htmlFor="travail">Beruf *</label>
              <input type="text" id="travail" name="travail" value={formData.travail}
                onChange={handleInputChange} className={errors.travail ? 'error' : ''}
                placeholder="Ihr Beruf" />
              {errors.travail && <span className="error-message">{errors.travail}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="salaireMensuel">Monatliches Gehalt (€) *</label>
              <input type="number" id="salaireMensuel" name="salaireMensuel"
                value={formData.salaireMensuel} onChange={handleInputChange}
                className={errors.salaireMensuel ? 'error' : ''}
                placeholder="Ihr monatliches Gehalt in Euro" min="0" step="0.01" />
              {errors.salaireMensuel && <span className="error-message">{errors.salaireMensuel}</span>}
            </div>
          </section>

          {/* ABSCHNITT 4: AUSWEISDOKUMENT */}
          <section className="form-section">
            <h2 className="section-title">🪪 Ausweisdokument</h2>
            <p className="section-desc">
              Laden Sie Ihren Personalausweis, Reisepass oder ein anderes offizielles Identitätsdokument hoch.
            </p>

            <div className="form-group">
              <label htmlFor="identityDocument">Identitätsnachweis * <span className="file-hint">(JPG, PNG oder PDF — max. 10 MB)</span></label>
              <div className={`file-drop-zone${identityFile ? ' has-file' : ''}${errors.identityFile ? ' error-border' : ''}`}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}>
                {!identityFile ? (
                  <>
                    <div className="file-drop-icon">📎</div>
                    <p className="file-drop-text">Klicken Sie hier, um Ihre Datei auszuwählen</p>
                    <p className="file-drop-sub">JPG · PNG · PDF</p>
                  </>
                ) : (
                  <div className="file-selected">
                    {identityPreview && identityPreview !== 'pdf' ? (
                      <img src={identityPreview} alt="Vorschau Ausweisdokument" className="id-preview-img" />
                    ) : (
                      <div className="pdf-preview">📄 {identityFile.name}</div>
                    )}
                    <p className="file-name-label">{identityFile.name}</p>
                    <button type="button" className="remove-file-btn"
                      onClick={(e) => { e.stopPropagation(); setIdentityFile(null); setIdentityPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}>
                      ✕ Entfernen
                    </button>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" id="identityDocument" name="identityDocument"
                accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} style={{ display: 'none' }} />
              {errors.identityFile && <span className="error-message">{errors.identityFile}</span>}
            </div>
          </section>

          {/* ABSCHNITT 5: VERTRAULICHKEITSKLAUSEL */}
          <section className="form-section confidentiality-section">
            <h2 className="section-title">🔒 Vertraulichkeitsklausel</h2>
            <div className="confidentiality-box">
              <h3>Vertraulichkeitsvereinbarung — FinanzPlus Austria &amp; Antragsteller</h3>
              <p>
                Die in diesem Formular erhobenen persönlichen Daten (Nachname, Vorname, Alter, Geschlecht,
                Adresse, Telefonnummer, Beruf, monatliches Gehalt und Ausweisdokument) sind
                <strong> ausschließlich für FinanzPlus Austria</strong> im Rahmen der Bewertung Ihres
                Kreditantrags bestimmt.
              </p>
              <p>
                FinanzPlus Austria verpflichtet sich:
              </p>
              <ul>
                <li>Ihre persönlichen Daten niemals an unbefugte Dritte weiterzugeben.</li>
                <li>Ihre Informationen ausschließlich im Rahmen Ihrer Kreditakte zu verwenden.</li>
                <li>Alle übermittelten Dokumente zu schützen und zu sichern.</li>
                <li>Die geltenden Datenschutzgesetze (DSGVO) einzuhalten.</li>
                <li>Ihre Daten auf einfache Anfrage zu löschen, sobald der Vorgang abgeschlossen ist.</li>
              </ul>
              <p>
                Durch das Ankreuzen des Kästchens unten bestätigen Sie, dass Sie die gesamte
                Vertraulichkeitsvereinbarung zwischen Ihnen und FinanzPlus Austria gelesen,
                verstanden und akzeptiert haben.
              </p>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input type="checkbox" name="accepteConfidentialite"
                  checked={formData.accepteConfidentialite} onChange={handleInputChange}
                  className={errors.accepteConfidentialite ? 'error' : ''} />
                <span>Ich habe die Vertraulichkeitsklausel zwischen mir und FinanzPlus Austria gelesen und akzeptiere sie. *</span>
              </label>
              {errors.accepteConfidentialite && <span className="error-message">{errors.accepteConfidentialite}</span>}
            </div>
          </section>

          {/* Statusmeldung */}
          {submitStatus && (
            <div className={`status-message ${submitStatus.type}`}>
              {submitStatus.message}
            </div>
          )}

          {/* ABSCHNITT 6: ABSENDEN */}
          <section className="form-section submit-section">
            <button type="submit" className="submit-button"
              disabled={!formData.accepteConfidentialite}>
              Antrag einreichen
            </button>
            <p className="submit-note">* Pflichtfelder</p>
          </section>

        </form>

        <footer className="footer">
          <p>© 2026 FinanzPlus Austria — Alle Rechte vorbehalten</p>
        </footer>
      </div>
    </div>
  );
}

export default App;

// Made with Bob
