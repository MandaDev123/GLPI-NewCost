# Vue.js & JavaScript - Fonctions Utilitaires sur les Tableaux

## Introduction

Dans Vue.js, les fonctions utilitaires JavaScript sont très utilisées pour :

* Transformer des données (`map`)
* Filtrer des données (`filter`)
* Parcourir des données (`forEach`)
* Rechercher un élément (`find`)
* Vérifier des conditions (`some`, `every`)
* Trier des données (`sort`)
* Agréger des données (`reduce`)

Ces fonctions sont souvent utilisées dans :

* les `computed`
* les méthodes
* les appels API
* les composants de tableau

---

# map()

Permet de transformer chaque élément d'un tableau.

## Syntaxe

```javascript
const nouveauTableau = tableau.map(element => {
    return transformation;
});
```

## Exemple simple

```javascript
const nombres = [1, 2, 3];

const doubles = nombres.map(n => n * 2);

console.log(doubles);
```

Résultat :

```javascript
[2, 4, 6]
```

---

## Exemple Vue.js

```javascript
const users = ref([
    { id: 1, name: 'Jean' },
    { id: 2, name: 'Paul' }
]);

const noms = computed(() =>
    users.value.map(user => user.name)
);
```

Résultat :

```javascript
['Jean', 'Paul']
```

---

# filter()

Permet de conserver uniquement les éléments répondant à une condition.

## Syntaxe

```javascript
const resultat = tableau.filter(element => condition);
```

---

## Exemple

```javascript
const nombres = [10, 20, 30, 40];

const grands = nombres.filter(n => n > 20);
```

Résultat :

```javascript
[30, 40]
```

---

## Exemple Vue.js

```javascript
const tickets = ref([
    { id: 1, status: 'OPEN' },
    { id: 2, status: 'CLOSED' },
    { id: 3, status: 'OPEN' }
]);

const openTickets = computed(() =>
    tickets.value.filter(
        ticket => ticket.status === 'OPEN'
    )
);
```

---

# find()

Retourne le premier élément trouvé.

## Exemple

```javascript
const users = [
    { id: 1, name: 'Jean' },
    { id: 2, name: 'Paul' }
];

const user = users.find(
    u => u.id === 2
);
```

Résultat :

```javascript
{
    id: 2,
    name: 'Paul'
}
```

---

# findIndex()

Retourne l'index du premier élément trouvé.

```javascript
const index = users.findIndex(
    u => u.id === 2
);

console.log(index);
```

Résultat :

```javascript
1
```

---

# forEach()

Permet de parcourir un tableau.

⚠️ Ne retourne rien.

## Exemple

```javascript
users.forEach(user => {
    console.log(user.name);
});
```

---

## Cas pratique

```javascript
selectedItems.value.forEach(item => {
    console.log(item.id);
});
```

---

# for...of

Très utile avec async/await.

## Exemple

```javascript
for (const item of items) {
    console.log(item);
}
```

---

## Avec await

```javascript
for (const item of items) {
    await save(item);
}
```

---

## Pourquoi pas forEach ?

Mauvais :

```javascript
items.forEach(async item => {
    await save(item);
});
```

Le `await` n'est pas attendu correctement.

---

## Bonne pratique

```javascript
for (const item of items) {
    await save(item);
}
```

---

# some()

Retourne true si au moins un élément satisfait la condition.

```javascript
const hasAdmin = users.some(
    user => user.role === 'ADMIN'
);
```

Résultat :

```javascript
true
```

---

# every()

Retourne true si tous les éléments satisfont la condition.

```javascript
const allActive = users.every(
    user => user.active
);
```

---

# reduce()

Permet d'agréger des données.

---

## Somme

```javascript
const total = [10, 20, 30]
    .reduce(
        (sum, value) => sum + value,
        0
    );
```

Résultat :

```javascript
60
```

---

## Somme d'un champ

```javascript
const totalCost = items.reduce(
    (sum, item) => sum + item.cost_total,
    0
);
```

---

## Cas pratique Vue.js

```javascript
const totalCost = computed(() =>
    items.value.reduce(
        (sum, item) =>
            sum + item.cost_total,
        0
    )
);
```

---

# sort()

Permet de trier un tableau.

## Ordre croissant

```javascript
const numbers = [3, 1, 5];

numbers.sort(
    (a, b) => a - b
);
```

Résultat :

```javascript
[1, 3, 5]
```

---

## Ordre décroissant

```javascript
numbers.sort(
    (a, b) => b - a
);
```

---

## Trier des objets

```javascript
users.sort(
    (a, b) =>
        a.name.localeCompare(b.name)
);
```

---

# Chaînage map + filter

Très fréquent dans Vue.js.

```javascript
const result = users
    .filter(
        user => user.active
    )
    .map(
        user => user.name
    );
```

Résultat :

```javascript
[
    'Jean',
    'Paul'
]
```

---

# Cas réel : Tableau Vue.js

```javascript
const totalOpenCost = computed(() =>
    items.value
        .filter(
            item => item.status === 'OPEN'
        )
        .reduce(
            (sum, item) =>
                sum + item.cost_total,
            0
        )
);
```

---

# Quand utiliser quoi ?

| Fonction  | Utilisation             |
| --------- | ----------------------- |
| map       | Transformer des données |
| filter    | Filtrer des données     |
| find      | Chercher un élément     |
| findIndex | Chercher l'index        |
| forEach   | Parcourir sans retour   |
| for...of  | Parcourir avec await    |
| some      | Vérifier au moins un    |
| every     | Vérifier tous           |
| reduce    | Calculer un total       |
| sort      | Trier                   |
| includes  | Vérifier une présence   |

---

# Bonnes pratiques Vue.js

✅ Utiliser `computed` pour les transformations d'affichage.

✅ Utiliser `map`, `filter`, `reduce` plutôt que des boucles manuelles.

✅ Utiliser `for...of` avec `await`.

✅ Éviter `forEach(async ...)`.

✅ Éviter de modifier directement un tableau dans un `computed`.

✅ Utiliser le chaînage :

```javascript
filter()
map()
reduce()
```

pour garder un code lisible.
