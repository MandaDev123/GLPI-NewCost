Alea possible 

- Historique de tous les mouvements par ticket / composant / item 
- Dans le dialog de réouverture, afficher le calcul en temps réel selon le mode choisi (preview du montant avant validation). ticketkanban
- Page "Historique des Coûts" (nouvelle route /CostHistory)

Tableau avec :
Ticket ID + Nom
External ID
Date du mouvement
Type (Close / Open / Cancel)
Montant Supercost / Réouverture
Mode utilisé (pour les réouvertures)

Filtres : par type d’équipement, par période, par ticket.
Export CSV (très facile avec PapaParse ou juste JSON.stringify + blob).

- Améliorations sur le calcul des coûts (très important)
Dans sqlliteServices.js + ItemList.vue :

Ajouter le coût moyen par item (pas seulement le total).
Gérer les tickets sans item (coûts "généraux") → catégorie "Autres".
Pondération intelligente : si un ticket est lié à 1 ordinateur + 2 moniteurs, répartir différemment (ex: 60% ordi, 20% par moniteur).

- Coloration conditionnelle dans le tableau ItemList (rouge si réouverture > 30% du total par exemple). 
- Calcul du coût moyen par équipement (coût total / nombre de ticket liés)
- Dans la liste des tickets, afficher le coût total et le nombre de réouvertures.

- Si le dernier cout est par exemple > 100 , l'afficher en rouge et realiser une exception que le dernier doit etre inferieur a 100  

- Export du tableau récapitulatif (Excel ou PDF)
- Dans le Kanban : Nodification instantanne de la valeur de reouverture selon le mode choisi et le cout de base applique en pourcentage

- Dans detailTicket ,Quand on clique sur un ticket ,Afficher :
Ticket #25

Coût GLPI :
120 €

SuperCost :
50 €

Réouvertures :
20 €

Total :
190 €

Et :
Nombre de réouvertures : 3
Nombre d'annulation : 5
Nombre d'interventions : 5

- Total des coûts generes par tickets (nouvelles pages)

- Répartition du coût d'un ticket entre équipements par pourcentage :
PC = 50%
Moniteur = 30%
Téléphone = 20%

- Dans l'import ,Pourcentage > 100 ,on annule le mouvement et on met un message d'erreur sur cette ligne ,mais continue l'import

- Annulation intelligente
En ce moment ,cancel => supprime dernier coût

Ajouter : L'historique et permettre : Annuler un coût précis
Exemple :50,100,150

Supprimer uniquement : 100

- Édition manuelle d'un coût erroné : aujourd'hui on ne peut qu'ajouter (POST) ou supprimer le dernier (DELETE .../delete/:idticket),
pas d'UPDATE encore . Ajouter PUT /supercost/:id + UI pour corriger une ligne sans tout annuler/refaire  dans l'historique des modifications . 

- Gestion des catégories de coûts , Ajout nouveau Attribute dans supercost pour stocker la categorie du coût

Au lieu d'un simple montant : 100 €

Ajouter :

Main d'œuvre
Pièce détachée
Déplacement
Logiciel
Autre

Puis :

Catégorie	Montant
Main d'œuvre	150
Pièces	300