# ClasseViva Medie

Webapp che accede alle API non ufficiali di ClasseViva (Spaggiari), recupera i voti e calcola la **media ponderata** e **semplice** per ogni materia.

## Online

- Codice: https://github.com/AleUrba08/classeviva-medie  
- Anteprima UI: https://classeviva-medie.vercel.app  

**Importante:** Spaggiari blocca le richieste dai server cloud (Vercel). Il login con i voti
funziona in **locale** (o con `npm run share`, che espone il tuo PC con un link temporaneo).

Creato da **Alessandro Urbani**.

## Avvio in locale

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5173  
- API proxy: http://localhost:3001  

Dopo il login vedi la **media ponderata e semplice per ogni materia**.

Condivisione temporanea dal tuo PC (IP di casa, accettato da Spaggiari):

```bash
npm run share
```

In produzione locale (un solo processo su porta 3001):

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
