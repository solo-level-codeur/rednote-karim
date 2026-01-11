# Justification des Choix Technologiques

## Frontend : Vue.js 3 + Vite
- **Vue.js 3 (Composition API)** :
  - **Modularité** : La Composition API permet de regrouper la logique par fonctionnalité (hooks/composables) plutôt que par option, facilitant la maintenance des composants complexes comme l'éditeur de notes.
  - **Performance** : Le Virtual DOM optimisé et la taille réduite du runtime garantissent une interface fluide.
  - **Écosystème** : Pinia pour le state management et Vue Router pour la navigation sont des standards robustes.

- **Vite** :
  - **Vitesse de développement** : Le Hot Module Replacement (HMR) instantané améliore considérablement l'expérience développeur.
  - **Build optimisé** : Utilise Rollup pour la production, générant des bundles légers et performants.

## Éditeur de Texte : TipTap
- **Headless** : Contrairement aux éditeurs classiques, TipTap n'impose pas de style. Il fournit une API robuste sur laquelle nous avons construit une interface sur mesure (Barre d'outils personnalisée, menus flottants).
- **Extensible** : L'architecture basée sur des extensions permet d'ajouter facilement des fonctionnalités (Images, Tableaux, YouTube, Collaboration temps réel).
- **Vue.js First** : Intégration native avec Vue, facilitant le binding de données.

## CSS Framework : Bulma (avec CSS Custom)
- **Flexbox based** : Système de grille moderne et simple.
- **Léger** : Pas de JavaScript imposé, ce qui évite les conflits avec Vue.
- **Personnalisable** : Utilisation de variables CSS (`:root`) pour le theming (couleurs, dark mode) par-dessus la structure Bulma.

## Backend (Base de Données) : MySQL
- **Relationnel** : La structure des données (Projets -> Notes -> Commentaires) est fortement relationnelle, ce qui justifie l'usage de SQL.
- **Intégrité** : Les contraintes de clés étrangères (ON DELETE CASCADE) assurent la cohérence des données (ex: supprimer un projet supprime ses notes).
