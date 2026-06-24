import React, { useState } from 'react';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    age: '',
    adresse: '',
    telephone: '',
    travail: '',
    revenuMensuel: '',
    montantPret: '',
    dureeRemboursement: '',
    accepteConditions: false
  });

  const [files, setFiles] = useState({
    identityDocument: null,
    photo: null
  });

  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);

  // Gestion des changements de champs texte
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Gestion des fichiers uploadés
  const handleFileChange = (e) => {
    const { name, files: uploadedFiles } = e.target;
    const file = uploadedFiles[0];

    if (file) {
      // Validation du type de fichier
      const allowedTypes = {
        identityDocument: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
        photo: ['image/jpeg', 'image/jpg', 'image/png']
      };

      if (!allowedTypes[name].includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          [name]: `Format nicht erlaubt. Erlaubte Formate: ${name === 'identityDocument' ? 'PDF, JPG, PNG' : 'JPG, PNG'}`
        }));
        e.target.value = '';
        return;
      }

      // Validation de la taille (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          [name]: 'Die Datei ist zu groß (max 10MB)'
        }));
        e.target.value = '';
        return;
      }

      setFiles(prev => ({ ...prev, [name]: file }));
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom.trim()) newErrors.nom = 'Nachname ist erforderlich';
    if (!formData.prenom.trim()) newErrors.prenom = 'Vorname ist erforderlich';
    if (!formData.age || formData.age < 18 || formData.age > 100) {
      newErrors.age = 'Das Alter muss zwischen 18 und 100 Jahren liegen';
    }
    if (!formData.adresse.trim()) newErrors.adresse = 'Adresse ist erforderlich';
    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Telefonnummer ist erforderlich';
    } else if (!/^\+?[\d\s\-()]+$/.test(formData.telephone)) {
      newErrors.telephone = 'Ungültiges Telefonformat';
    }
    if (!formData.travail.trim()) newErrors.travail = 'Beruf ist erforderlich';
    if (!formData.revenuMensuel || formData.revenuMensuel <= 0) {
      newErrors.revenuMensuel = 'Das monatliche Einkommen muss größer als 0 sein';
    }
    if (!formData.montantPret || formData.montantPret <= 0) {
      newErrors.montantPret = 'Der Kreditbetrag muss größer als 0 sein';
    }
    if (!formData.dureeRemboursement || formData.dureeRemboursement < 1 || formData.dureeRemboursement > 360) {
      newErrors.dureeRemboursement = 'Die Rückzahlungsdauer muss zwischen 1 und 360 Monaten liegen';
    }
    if (!files.identityDocument) {
      newErrors.identityDocument = 'Personalausweis/Reisepass ist erforderlich';
    }
    if (!files.photo) {
      newErrors.photo = 'Lichtbild ist erforderlich';
    }
    if (!formData.accepteConditions) {
      newErrors.accepteConditions = 'Sie müssen die Teilnahmebedingungen akzeptieren';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmitStatus({
        type: 'error',
        message: 'Bitte korrigieren Sie die Fehler im Formular'
      });
      return;
    }

    // Créer le corps de l'email avec toutes les informations EN ALLEMAND
    const emailBody = `
KREDITANTRAG FINANZPLUS AUSTRIA
=====================================

PERSÖNLICHE INFORMATIONEN
-------------------------
Name: ${formData.nom}
Vorname: ${formData.prenom}
Alter: ${formData.age} Jahre
Adresse: ${formData.adresse}

KONTAKTDATEN
------------
Telefonnummer: ${formData.telephone}

BERUFLICHE UND FINANZIELLE INFORMATIONEN
-----------------------------------------
Beruf: ${formData.travail}
Monatliches Einkommen: ${formData.revenuMensuel} €

KREDITDETAILS
-------------
Gewünschter Kreditbetrag: ${formData.montantPret} €
Rückzahlungsdauer: ${formData.dureeRemboursement} Monate

DOKUMENTE
---------
⚠️ WICHTIG: Bitte fügen Sie die folgenden Dokumente als Anhang zu dieser E-Mail hinzu:
- Personalausweis/Reisepass (${files.identityDocument ? files.identityDocument.name : 'Nicht bereitgestellt'})
- Lichtbild (${files.photo ? files.photo.name : 'Nicht bereitgestellt'})

ZUSTIMMUNG
----------
✓ Ich akzeptiere die Teilnahmebedingungen

=====================================
Einreichungsdatum: ${new Date().toLocaleString('de-DE')}
    `.trim();

    // Créer le lien mailto avec le sujet et le corps
    const subject = encodeURIComponent('Kreditantrag FinanzPlus Austria');
    const body = encodeURIComponent(emailBody);
    const mailtoLink = `mailto:kontakt_finanzplusaustria@proton.me?subject=${subject}&body=${body}`;

    // Ouvrir le client email
    window.location.href = mailtoLink;

    // Afficher un message de succès EN ALLEMAND
    setSubmitStatus({
      type: 'success',
      message: 'Ihr E-Mail-Client wird geöffnet. Vergessen Sie nicht, die Dokumente (Personalausweis und Foto) anzuhängen, bevor Sie senden!'
    });

    // Réinitialiser le formulaire après 3 secondes
    setTimeout(() => {
      setFormData({
        nom: '',
        prenom: '',
        age: '',
        adresse: '',
        telephone: '',
        travail: '',
        revenuMensuel: '',
        montantPret: '',
        dureeRemboursement: '',
        accepteConditions: false
      });
      setFiles({
        identityDocument: null,
        photo: null
      });
      
      // Réinitialiser les inputs de fichiers
      document.getElementById('identityDocument').value = '';
      document.getElementById('photo').value = '';
    }, 3000);
  };

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>FinanzPlus Austria</h1>
          <p className="subtitle">Kreditwürdigkeitsformular</p>
        </header>

        <form onSubmit={handleSubmit} className="form">
          {/* SECTION 1: INFORMATIONS PERSONNELLES */}
          <section className="form-section">
            <h2 className="section-title">📋 Persönliche Informationen</h2>
            
            <div className="form-group">
              <label htmlFor="nom">Nachname *</label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                className={errors.nom ? 'error' : ''}
                placeholder="Ihr Nachname"
              />
              {errors.nom && <span className="error-message">{errors.nom}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="prenom">Vorname *</label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                value={formData.prenom}
                onChange={handleInputChange}
                className={errors.prenom ? 'error' : ''}
                placeholder="Ihr Vorname"
              />
              {errors.prenom && <span className="error-message">{errors.prenom}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="age">Alter *</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className={errors.age ? 'error' : ''}
                placeholder="Ihr Alter"
                min="18"
                max="100"
              />
              {errors.age && <span className="error-message">{errors.age}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="adresse">Adresse *</label>
              <textarea
                id="adresse"
                name="adresse"
                value={formData.adresse}
                onChange={handleInputChange}
                className={errors.adresse ? 'error' : ''}
                placeholder="Ihre vollständige Adresse"
                rows="3"
              />
              {errors.adresse && <span className="error-message">{errors.adresse}</span>}
            </div>
          </section>

          {/* SECTION 2: COORDONNÉES */}
          <section className="form-section">
            <h2 className="section-title">📞 Kontaktdaten</h2>
            
            <div className="form-group">
              <label htmlFor="telephone">Telefonnummer *</label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleInputChange}
                className={errors.telephone ? 'error' : ''}
                placeholder="+43 XXX XXX XXXX"
              />
              {errors.telephone && <span className="error-message">{errors.telephone}</span>}
            </div>
          </section>

          {/* SECTION 3: INFORMATIONS PROFESSIONNELLES */}
          <section className="form-section">
            <h2 className="section-title">💼 Berufliche und Finanzielle Informationen</h2>
            
            <div className="form-group">
              <label htmlFor="travail">Beruf *</label>
              <input
                type="text"
                id="travail"
                name="travail"
                value={formData.travail}
                onChange={handleInputChange}
                className={errors.travail ? 'error' : ''}
                placeholder="Ihr Beruf"
              />
              {errors.travail && <span className="error-message">{errors.travail}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="revenuMensuel">Monatliches Einkommen (€) *</label>
              <input
                type="number"
                id="revenuMensuel"
                name="revenuMensuel"
                value={formData.revenuMensuel}
                onChange={handleInputChange}
                className={errors.revenuMensuel ? 'error' : ''}
                placeholder="Ihr monatliches Einkommen in Euro"
                min="0"
                step="0.01"
              />
              {errors.revenuMensuel && <span className="error-message">{errors.revenuMensuel}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="montantPret">Gewünschter Kreditbetrag (€) *</label>
              <input
                type="number"
                id="montantPret"
                name="montantPret"
                value={formData.montantPret}
                onChange={handleInputChange}
                className={errors.montantPret ? 'error' : ''}
                placeholder="Wie viel möchten Sie leihen?"
                min="0"
                step="0.01"
              />
              {errors.montantPret && <span className="error-message">{errors.montantPret}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="dureeRemboursement">Rückzahlungsdauer (Monate) *</label>
              <input
                type="number"
                id="dureeRemboursement"
                name="dureeRemboursement"
                value={formData.dureeRemboursement}
                onChange={handleInputChange}
                className={errors.dureeRemboursement ? 'error' : ''}
                placeholder="Anzahl der Monate"
                min="1"
                max="360"
              />
              {errors.dureeRemboursement && <span className="error-message">{errors.dureeRemboursement}</span>}
            </div>
          </section>

          {/* SECTION 4: DOCUMENTS */}
          <section className="form-section">
            <h2 className="section-title">📎 Dokumente und Nachweise</h2>
            
            <div className="form-group">
              <label htmlFor="identityDocument">Personalausweis / Reisepass *</label>
              <input
                type="file"
                id="identityDocument"
                name="identityDocument"
                onChange={handleFileChange}
                className={errors.identityDocument ? 'error' : ''}
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <small className="help-text">Erlaubte Formate: PDF, JPG, PNG (max 10MB)</small>
              {files.identityDocument && (
                <div className="file-preview">✓ {files.identityDocument.name}</div>
              )}
              {errors.identityDocument && <span className="error-message">{errors.identityDocument}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="photo">Lichtbild *</label>
              <input
                type="file"
                id="photo"
                name="photo"
                onChange={handleFileChange}
                className={errors.photo ? 'error' : ''}
                accept=".jpg,.jpeg,.png"
              />
              <small className="help-text">Erlaubte Formate: JPG, PNG (max 10MB)</small>
              {files.photo && (
                <div className="file-preview">✓ {files.photo.name}</div>
              )}
              {errors.photo && <span className="error-message">{errors.photo}</span>}
            </div>
          </section>

          {/* SECTION 5: CONDITIONS D'ÉLIGIBILITÉ */}
          <section className="form-section eligibility-section">
            <h2 className="section-title">✓ Teilnahmebedingungen</h2>
            
            <div className="eligibility-content">
              <p className="eligibility-intro">
                Um von unserem Kreditangebot von FinanzPlus Austria zu profitieren, müssen Sie die folgenden Kriterien erfüllen:
              </p>
              
              <h3>Dedizierte Telefonnummer</h3>
              <p>
                Sie müssen über eine <strong>unbenutzte Telefonnummer</strong> verfügen, die noch nie bei einem
                Kommunikationsdienst (WhatsApp, Telegram, Signal usw.) registriert wurde. Diese Nummer wird
                ausschließlich als sichere Bankkontoidentifikation verwendet und erleichtert so Transaktionen
                und Rückzahlungen Ihres Kredits ohne Interferenz mit anderen Drittanbieterdiensten.
              </p>
              <p>
                Diese Maßnahme garantiert eine <strong>optimale Rückverfolgbarkeit</strong> Ihrer Zahlungen und
                eine sichere Verwaltung Ihres Rückzahlungskontos.
              </p>
              <p className="eligibility-note">
                Wenn Sie derzeit keine Telefonnummer haben, die diese Kriterien erfüllt, oder wenn Sie in der
                Lage sind, eine für berufliche Zwecke zu beschaffen, aktivieren Sie bitte das Kontrollkästchen
                unten, um Ihre Zustimmung zu diesen Teilnahmebedingungen zu bestätigen.
              </p>
            </div>
          </section>

          {/* SECTION 6: CONSENTEMENT */}
          <section className="form-section">
            <h2 className="section-title">✍️ Zustimmung</h2>
            
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="accepteConditions"
                  checked={formData.accepteConditions}
                  onChange={handleInputChange}
                  className={errors.accepteConditions ? 'error' : ''}
                />
                <span>Ich akzeptiere die Teilnahmebedingungen *</span>
              </label>
              {errors.accepteConditions && <span className="error-message">{errors.accepteConditions}</span>}
            </div>
          </section>

          {/* Message de statut */}
          {submitStatus && (
            <div className={`status-message ${submitStatus.type}`}>
              {submitStatus.message}
            </div>
          )}

          {/* SECTION 7: SOUMISSION */}
          <section className="form-section submit-section">
            <button
              type="submit"
              className="submit-button"
              disabled={!formData.accepteConditions}
            >
              Antrag einreichen
            </button>
            <p className="submit-note">
              * Pflichtfelder
            </p>
          </section>
        </form>

        <footer className="footer">
          <p>© 2026 FinanzPlus Austria - Alle Rechte vorbehalten</p>
        </footer>
      </div>
    </div>
  );
}

export default App;

// Made with Bob
