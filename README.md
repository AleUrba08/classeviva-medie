# ClasseViva Medie

Webapp che accede alle API non ufficiali di ClasseViva (Spaggiari), recupera i voti e calcola la **media ponderata** e **semplice** per ogni materia.

Creato da **Alessandro Urbani**.

## Online (consigliato)

Host gratuito su **Cloudflare Workers** (Spaggiari blocca Vercel, ma accetta Cloudflare).

```bash
npm install
npm run deploy:cf:temp
```

Poi reclama l’account gratuito dal Claim URL stampato (entro 60 minuti) e ridistribuisci con:

```bash
npx wrangler login
npm run deploy
```

- Codice: https://github.com/AleUrba08/classeviva-medie  

## Avvio in locale

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5173  
- API proxy: http://localhost:3001  

Dopo il login vedi la **media ponderata e semplice per ogni materia**.

## Note

- Progetto non ufficiale e non affiliato a Spaggiari.
- Vengono considerati solo i voti numerici non annullati.
- La media ponderata usa il campo `weightFactor` restituito dall’API.
- Le credenziali non vengono salvate: servono solo per la richiesta.
