const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration de Multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Validation des types de fichiers
const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Format de fichier non autorisé. Formats acceptés: PDF, JPG, PNG'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 Mo max
  }
});

// Configuration de Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.protonmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'API FinanzPlus Austria - Serveur actif' });
});

// Route pour soumettre le formulaire
app.post('/api/submit-application', upload.single('identityDocument'), async (req, res) => {
  try {
    const {
      nom,
      prenom,
      age,
      sexe,
      adresse,
      telephone,
      travail,
      salaireMensuel,
      accepteConfidentialite
    } = req.body;

    // Validation des champs obligatoires
    if (!nom || !prenom || !age || !sexe || !adresse || !telephone || !travail || !salaireMensuel) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs obligatoires doivent être remplis.'
      });
    }

    if (accepteConfidentialite !== 'true') {
      return res.status(400).json({
        success: false,
        message: 'Vous devez accepter la clause de confidentialité.'
      });
    }

    // Vérification de la pièce d'identité
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'La pièce d\'identité est obligatoire.'
      });
    }

    const identityDoc = req.file;
    const isImage = ['.jpg', '.jpeg', '.png'].includes(path.extname(identityDoc.originalname).toLowerCase());

    // Préparation de l'email HTML
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_DEST || 'kontakt_finanzplusaustria@proton.me',
      subject: `Nouvelle demande — ${prenom} ${nom}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #1f2328;">
          <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">FinanzPlus Austria</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Nouvelle demande reçue</p>
          </div>

          <div style="padding: 30px; background: #ffffff; border: 1px solid #e5e7eb; border-top: none;">

            <h2 style="color: #667eea; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">📋 Informations personnelles</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
              <tr>
                <td style="padding: 10px 12px; background: #f7f8fa; font-weight: 600; width: 40%; border: 1px solid #e5e7eb;">Nom de famille</td>
                <td style="padding: 10px 12px; border: 1px solid #e5e7eb;">${nom}</td>
              </tr>
              <tr>
                <td style="padding: 10px 12px; background: #f7f8fa; font-weight: 600; border: 1px solid #e5e7eb;">Prénom</td>
                <td style="padding: 10px 12px; border: 1px solid #e5e7eb;">${prenom}</td>
              </tr>
              <tr>
                <td style="padding: 10px 12px; background: #f7f8fa; font-weight: 600; border: 1px solid #e5e7eb;">Âge</td>
                <td style="padding: 10px 12px; border: 1px solid #e5e7eb;">${age} ans</td>
              </tr>
              <tr>
                <td style="padding: 10px 12px; background: #f7f8fa; font-weight: 600; border: 1px solid #e5e7eb;">Sexe</td>
                <td style="padding: 10px 12px; border: 1px solid #e5e7eb;">${sexe}</td>
              </tr>
              <tr>
                <td style="padding: 10px 12px; background: #f7f8fa; font-weight: 600; border: 1px solid #e5e7eb;">Adresse</td>
                <td style="padding: 10px 12px; border: 1px solid #e5e7eb;">${adresse}</td>
              </tr>
            </table>

            <h2 style="color: #667eea; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">📞 Coordonnées</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
              <tr>
                <td style="padding: 10px 12px; background: #f7f8fa; font-weight: 600; width: 40%; border: 1px solid #e5e7eb;">Numéro de téléphone</td>
                <td style="padding: 10px 12px; border: 1px solid #e5e7eb;">${telephone}</td>
              </tr>
            </table>

            <h2 style="color: #667eea; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">💼 Informations professionnelles</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
              <tr>
                <td style="padding: 10px 12px; background: #f7f8fa; font-weight: 600; width: 40%; border: 1px solid #e5e7eb;">Profession</td>
                <td style="padding: 10px 12px; border: 1px solid #e5e7eb;">${travail}</td>
              </tr>
              <tr>
                <td style="padding: 10px 12px; background: #f7f8fa; font-weight: 600; border: 1px solid #e5e7eb;">Salaire mensuel</td>
                <td style="padding: 10px 12px; border: 1px solid #e5e7eb;">${salaireMensuel} €</td>
              </tr>
            </table>

            <h2 style="color: #667eea; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">🪪 Pièce d'identité</h2>
            <p style="margin-bottom: 15px;">
              La pièce d'identité est jointe en pièce jointe à cet email
              (<strong>${identityDoc.originalname}</strong>).
              ${isImage ? 'Un aperçu est disponible ci-dessous.' : ''}
            </p>
            ${isImage ? `<img src="cid:identity_doc" alt="Pièce d'identité" style="max-width: 100%; border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 20px;" />` : ''}

            <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; border-radius: 0 6px 6px 0; margin-top: 10px;">
              <strong style="color: #065f46;">✅ Clause de confidentialité acceptée</strong>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #065f46;">
                Le demandeur confirme avoir lu et accepté l'accord de confidentialité entre lui et FinanzPlus Austria.
              </p>
            </div>
          </div>

          <div style="padding: 15px 30px; background: #f7f8fa; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="margin: 0; font-size: 12px; color: #57606a;">
              Date de soumission : ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `piece_identite_${nom}_${prenom}${path.extname(identityDoc.originalname)}`,
          path: identityDoc.path,
          ...(isImage ? { cid: 'identity_doc' } : {})
        }
      ]
    };

    // Envoi de l'email
    await transporter.sendMail(mailOptions);

    // Suppression du fichier temporaire après envoi
    fs.unlinkSync(identityDoc.path);

    res.json({
      success: true,
      message: 'Votre demande a été soumise avec succès. Nous vous contacterons très prochainement.'
    });

  } catch (error) {
    console.error('Erreur lors de la soumission:', error);

    // Nettoyage du fichier en cas d'erreur
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
    }

    res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la soumission. Veuillez réessayer.',
      error: error.message
    });
  }
});

// Gestion des erreurs Multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Le fichier est trop volumineux. Taille maximale : 10 Mo.'
      });
    }
  }

  res.status(500).json({
    success: false,
    message: error.message || 'Une erreur est survenue'
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur FinanzPlus Austria démarré sur le port ${PORT}`);
  console.log(`📧 Email de destination: ${process.env.EMAIL_DEST || 'kontakt_finanzplusaustria@proton.me'}`);
});

// Made with Bob
