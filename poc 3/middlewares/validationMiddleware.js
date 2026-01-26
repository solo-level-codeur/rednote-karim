const validateRegister = (req, res, next) => {
  const { firstname, lastname, email, password } = req.body;
  
  const validationRules = {
    name: /^[a-zA-Z\s'-]{2,30}$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  };
  
  if (!validationRules.name.test(firstname)) {
    return res.status(400).json({ message: 'Prénom invalide (2-30 caractères, lettres uniquement)' });
  }
  
  if (!validationRules.name.test(lastname)) {
    return res.status(400).json({ message: 'Nom invalide (2-30 caractères, lettres uniquement)' });
  }
  
  if (!validationRules.email.test(email)) {
    return res.status(400).json({ message: 'Email invalide' });
  }
  
  if (!validationRules.password.test(password)) {
    return res.status(400).json({ message: 'Mot de passe invalide (8 caractères min, 1 majuscule, 2 chiffres, 1 caractère spécial)' });
  }
  
  next();
};

module.exports = { validateRegister };