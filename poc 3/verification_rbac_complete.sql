-- VÉRIFICATION COMPLÈTE DU SYSTÈME RBAC
-- Elite Project - Audit de sécurité des permissions

USE elite_notes;

-- =====================================
-- 1. MATRICE COMPLÈTE PERMISSIONS PAR RÔLE
-- =====================================
SELECT 
    r.role_id,
    r.role_name,
    p.permission_name,
    'AUTORISÉ' as status
FROM roles r 
JOIN role_permissions rp ON r.role_id = rp.role_id
JOIN permissions p ON rp.permission_id = p.permission_id  
ORDER BY r.role_id, p.permission_name;

-- =====================================
-- 2. PERMISSIONS MANQUANTES PAR RÔLE  
-- =====================================
SELECT 
    r.role_id,
    r.role_name,
    p.permission_name,
    'MANQUANTE' as status
FROM roles r 
CROSS JOIN permissions p
WHERE NOT EXISTS (
    SELECT 1 FROM role_permissions rp 
    WHERE rp.role_id = r.role_id AND rp.permission_id = p.permission_id
)
ORDER BY r.role_id, p.permission_name;

-- =====================================
-- 3. RÉCAPITULATIF PAR RÔLE
-- =====================================
SELECT 
    r.role_name,
    COUNT(rp.permission_id) as total_permissions,
    GROUP_CONCAT(p.permission_name ORDER BY p.permission_name) as permissions_list
FROM roles r 
LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.permission_id
GROUP BY r.role_id, r.role_name
ORDER BY r.role_id;

-- =====================================
-- 4. VÉRIFICATION COHÉRENCE HIÉRARCHIQUE
-- =====================================
-- Admin doit avoir TOUTES les permissions
SELECT 'ADMIN_CHECK' as verification,
    CASE 
        WHEN (SELECT COUNT(*) FROM role_permissions WHERE role_id = 1) = 
             (SELECT COUNT(*) FROM permissions)
        THEN 'CORRECT - Admin a toutes les permissions'
        ELSE 'ERREUR - Admin manque des permissions'
    END as resultat;

-- Manager doit avoir plus de permissions que Developer
SELECT 'MANAGER_VS_DEVELOPER' as verification,
    CASE 
        WHEN (SELECT COUNT(*) FROM role_permissions WHERE role_id = 2) > 
             (SELECT COUNT(*) FROM role_permissions WHERE role_id = 3)
        THEN 'CORRECT - Manager > Developer'
        ELSE 'ERREUR - Hiérarchie incorrecte'
    END as resultat;

-- =====================================
-- 5. LISTE TOUTES LES PERMISSIONS EXISTANTES
-- =====================================
SELECT permission_id, permission_name, 'DÉFINIE' as status
FROM permissions 
ORDER BY permission_name;