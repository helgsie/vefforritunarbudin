## Verkefni í vefforritun 1

Hægt er að sjá vefsíðuna á eftirfarandi hlekk: https://vef-vefforritunarbudin.netlify.app

Til að keyra verkefnið: `npm run dev`

Til að linta verkefnið: `npm run lint`

### Uppsetning verkefnis

Útlit vefsíðunnar er eftir fyrirmynd sem kennari gaf nemendum.

HTML-ið er búið til í javascript og því er body í index.html skjalinu tómt.

CSS-ið er skrifað með Sass og skiptist í mörg .scss skjöl í /styles möppu sem compilast svo í eitt styles.css skjal. CSS-ið notar Sass variables sem eru skilgreindir í _config.scss.

Javascriptið er í index.js skjali og einnig í /lib möppu.

Stylelint og Eslint eru sett upp og keyrast með npm run lint.
