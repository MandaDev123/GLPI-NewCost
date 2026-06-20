# 1. Historique complet des mouvements

## Objectif

Conserver l'ensemble des opérations effectuées sur les tickets afin d'assurer la traçabilité des coûts.

## Nouvelle page

Route :

```text
/CostHistory
```

## Informations affichées

| Ticket | External ID | Date  | Mouvement | Valeur | Mode   |
| ------ | ----------- | ----- | --------- | ------ | ------ |
| 15     | INC001      | 10/07 | Close     | 100    | -      |
| 15     | INC001      | 12/07 | Open      | 10     | Mode 3 |
| 15     | INC001      | 13/07 | Cancel    | -      | -      |

## Filtres

* Par ticket
* Par période
* Par équipement
* Par type de mouvement

## Intérêt

* Audit des opérations
* Historique des coûts
* Analyse des réouvertures

---

# 2. Détail complet d'un ticket

## Objectif

Afficher une vue détaillée de tous les coûts liés à un ticket.

## Nouvelle page

```text
/TicketDetail/:id
```

## Informations affichées

```text
Ticket #25

Coût GLPI : 120 €

SuperCost : 50 €

Réouvertures : 20 €

Total : 190 €
```

## Statistiques

```text
Nombre de réouvertures : 3

Nombre d'annulations : 2

Nombre d'interventions : 5
```

## Intérêt

Permet d'obtenir une vision complète du coût réel d'un ticket.

---

# 3. Prévisualisation du calcul de réouverture

## Objectif

Afficher en temps réel le montant calculé avant validation.

## Exemple

Historique :

```text
50
100
150
```

Mode sélectionné :

```text
Mode 3 (Moyenne)
```

Pourcentage :

```text
10%
```

Prévisualisation :

```text
Base utilisée : 100

10 % de 100 = 10 €

Montant de réouverture = 10 €
```

## Intérêt

* Réduction des erreurs
* Compréhension du calcul
* Meilleure expérience utilisateur

---

# 4. Validation métier des coûts

## Objectif

Contrôler les données saisies ou importées.

## Règles proposées

* Pourcentage inférieur ou égal à 100
* Coût positif uniquement
* Coût obligatoire
* Valeurs numériques uniquement

## Contrôles visuels

* Coût supérieur à 100 € : affichage en rouge
* Coût supérieur à 1000 € : alerte visuelle

## Import

Si une ligne est invalide :

```text
Ligne 5 rejetée :
Pourcentage supérieur à 100
```

L'import continue sur les autres lignes.

## Intérêt

Garantit la cohérence des données.

---

# 5. Édition manuelle d'un coût

## Objectif

Corriger un coût erroné sans devoir le supprimer puis le recréer.

## Évolution Backend

Ajout :

```http
PUT /supercost/:id
```

## Exemple

Avant :

```text
100 €
```

Après modification :

```text
150 €
```

## Intérêt

* Correction rapide
* Réduction des erreurs
* Meilleure maintenance des données

---

# 6. Coût moyen par équipement

## Objectif

Afficher le coût moyen généré par chaque type d'équipement.

## Formule

```text
Coût moyen = Coût total / Nombre de tickets
```

## Exemple

| Équipement | Coût total | Tickets | Coût moyen |
| ---------- | ---------- | ------- | ---------- |
| Ordinateur | 500 €      | 10      | 50 €       |

## Intérêt

Identifier les équipements les plus coûteux à maintenir.

---

# 7. Nombre de réouvertures dans la liste des tickets

## Objectif

Afficher directement les indicateurs de coût dans la liste des tickets.

## Exemple

| Ticket | Coût total | Réouvertures |
| ------ | ---------- | ------------ |
| 15     | 250 €      | 3            |

## Intérêt

Repérer rapidement les tickets problématiques.

---

# 8. Export Excel / CSV

## Objectif

Exporter les rapports de coûts.

## Export possible

* Tableau récapitulatif des équipements
* Historique des mouvements
* Détail des tickets

## Formats

* CSV
* Excel (.xlsx)

## Intérêt

Analyse externe et reporting.

---

# 9. Gestion des catégories de coûts

## Objectif

Qualifier la nature des dépenses.

## Nouvelle colonne SQLite

```sql
categorie TEXT
```

## Catégories

* Main d'œuvre
* Pièce détachée
* Déplacement
* Logiciel
* Autre

## Exemple

| Catégorie    | Montant |
| ------------ | ------- |
| Main d'œuvre | 150 €   |
| Logiciel     | 300 €   |

## Intérêt

Analyse détaillée des dépenses.

---

# 10. Annulation intelligente

## Objectif

Supprimer un coût précis plutôt que le dernier coût enregistré.

## Exemple

Historique :

```text
50 €
100 €
150 €
```

Suppression :

```text
100 €
```

Historique restant :

```text
50 €
150 €
```

## Intérêt

Plus de flexibilité dans la gestion des erreurs.

---

# 11. Gestion des tickets sans équipement

## Objectif

Gérer les tickets qui ne sont associés à aucun matériel.

## Exemple

* Formation utilisateur
* Assistance logicielle
* Audit

## Nouvelle catégorie

```text
Autres
```

## Intérêt

Éviter la perte d'information lors des calculs.

---

# 12. Répartition intelligente des coûts

## Objectif

Répartir un coût entre plusieurs équipements selon un pourcentage défini.

## Exemple

Ticket :

```text
300 €
```

Répartition :

```text
PC = 50 %

Moniteur = 30 %

Téléphone = 20 %
```

Résultat :

```text
PC = 150 €

Moniteur = 90 €

Téléphone = 60 €
```

## Intérêt

Calcul plus réaliste des coûts par équipement.

---

# 13. Statistiques globales des tickets

## Nouvelle page

```text
/Statistics
```

## Informations affichées

| Ticket | Coût total |
| ------ | ---------- |
| 15     | 500 €      |
| 22     | 300 €      |

## Indicateurs

* Ticket le plus coûteux
* Nombre de réouvertures
* Coût moyen des tickets
* Total des coûts générés

## Intérêt

Vision globale de l'activité.

---

# 14. Coloration conditionnelle

## Objectif

Mettre en évidence les situations anormales.

## Règles

* Réouverture > 30 % du coût total → rouge
* Coût élevé → orange
* Valeurs normales → vert

## Intérêt

Identification rapide des anomalies.
