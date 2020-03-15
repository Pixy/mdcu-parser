# MDCU-PARSER

Le but est de parser la collection Marvel Now! du site https://www.mdcu-comics.fr/, afin de collecter tous les tomes regroupés par séries.
Ensuite on les affiche par liste, triés par date.

Comment utiliser le projet ?

## Récupérer les infos du site.

Prérequis, il faut un mongodb local installé et lancé.
```sh
npm install
npm run parse
```

# Lancer le serveur API
```sh
npm run api
```

Et laisser tourner en background.

# Lancer le site 
```sh
npm run web
```

Et accéder à http://localhost:8000/

Et wouala =)
