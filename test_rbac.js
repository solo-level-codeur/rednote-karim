// Test rapide du système RBAC
const { hasPermission } = require('./poc 3/models/rbac');

async function testRBAC() {
  console.log('🧪 Test RBAC...');
  
  try {
    // Test avec un utilisateur existant (ID 1 = Admin dans votre DB)
    const canCreateNotes = await hasPermission(1, 'create_notes');
    const canManageUsers = await hasPermission(1, 'manage_users');
    
    console.log('Admin peut créer notes:', canCreateNotes);
    console.log('Admin peut gérer users:', canManageUsers);
    
    // Test avec utilisateur inexistant
    const cantDoAnything = await hasPermission(999, 'create_notes');
    console.log('User 999 peut créer notes:', cantDoAnything);
    
  } catch (error) {
    console.error('❌ Erreur test:', error.message);
  }
}

testRBAC();