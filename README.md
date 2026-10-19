# ClasseViva Medie

Webapp che accede alle API non ufficiali di ClasseViva (Spaggiari), recupera i voti e calcola la **media ponderata** e **semplice** per ogni materia.

## Avvio

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5173  
- API proxy: http://localhost:3001  

In produzione (un solo processo su porta 3001):

```bash
npm run build
npm start
```

## Credenziali

Usa lo stesso **codice utente** e **password** del portale [web.spaggiari.eu](https://web.spaggiari.eu).

Le credenziali vengono inviate solo al server locale, che le inoltra a Spaggiari per la sessione: **non vengono salvate**.

## Note

- Progetto non ufficiale e non affiliato a Spaggiari.
- Vengono considerati solo i voti numerici non annullati.
- La media ponderata usa il campo `weightFactor` restituito dall’API.
