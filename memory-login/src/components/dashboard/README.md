# Dashboard Module Documentation

## 📁 Structure des Composants

```
dashboard/
├── DashboardHeader.vue    # 🏗️ En-tête avec salutation et déconnexion
└── DashboardStats.vue     # 📊 Cartes de statistiques des notes
```

**Utilisé dans :** `DashboardView.vue` (page d'accueil après connexion)

---

## 🏗️ Dashboard Components

### DashboardHeader.vue
**Responsabilité :** En-tête du dashboard avec salutation personnalisée et bouton de déconnexion.

| Props | Type | Description |
|-------|------|-------------|
| `userName` | String | Nom de l'utilisateur connecté |

| Events | Payload | Description |
|--------|---------|-------------|
| `@logout` | - | Demande de déconnexion |

**Fonctionnalités :**
- ✅ Salutation personnalisée avec emoji animé
- ✅ Bouton de déconnexion
- ✅ Design responsive

### DashboardStats.vue
**Responsabilité :** Affichage des statistiques des notes sous forme de cartes.

| Props | Type | Description |
|-------|------|-------------|
| `totalNotes` | Number | Nombre total de notes |
| `todayNotes` | Number | Notes créées aujourd'hui |
| `weekNotes` | Number | Notes créées cette semaine |

**Fonctionnalités :**
- ✅ 3 cartes de statistiques avec icônes
- ✅ Layout flexible (ligne sur desktop, colonne sur mobile)
- ✅ Style intégré dans la section hero

---

## 🔄 Flux de données dans DashboardView

```
DashboardView (orchestrateur)
    ↓ props
DashboardHeader ← → DashboardStats
    ↓ events            ↓ props
DashboardView → NotesList
```

1. **Chargement :** DashboardView → API → calcul stats → DashboardStats
2. **Déconnexion :** DashboardHeader → DashboardView → authStore
3. **Notes :** NotesList (module indépendant)

---

## 📊 Comparaison Avant/Après

### **AVANT :**
- DashboardView.vue = **303 lignes** monolithe 🔥

### **APRÈS :**
- DashboardView.vue = **144 lignes** (orchestrateur)
- DashboardHeader.vue = **95 lignes**
- DashboardStats.vue = **84 lignes**

**Total :** 323 lignes bien organisées vs 303 lignes monolithe

---

## 🎨 Avantages de cette architecture

- ✅ **Composants réutilisables** (header, stats)
- ✅ **CSS simplifié** (plus de gradients complexes)
- ✅ **Logique claire** par composant
- ✅ **Testabilité** unitaire possible
- ✅ **Responsive** design cohérent
- ✅ **Maintenance** facilitée

---

## 🤝 Intégration avec autres modules

Le module `dashboard/` utilise :
- **notes/NotesList.vue** - Affichage des notes
- **Side.vue** - Navigation latérale
- **authStore** - Gestion de l'authentification

Il est **compatible** avec l'architecture modulaire existante.