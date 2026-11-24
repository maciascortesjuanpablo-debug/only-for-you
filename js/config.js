/* ============================================================
   ✏️  AQUÍ CAMBIAS TODOS LOS TEXTOS (no hace falta tocar nada más)
   Consejo: mientras más específico y real sea cada texto
   (bromas internas, cosas que solo ustedes saben), mejor.
   ============================================================ */
const CONFIG = {
  paraQuien: "Isa",                     // su nombre o apodo
  fechaReencuentro: "2026-09-27",       // el día que volvieron a hablar (formato AAAA-MM-DD)
  deParte:   "tu cielo",                // tu nombre o cómo firmas (ella te dice «cielo»)

  /* Pruebas de que me gustas: salen de una en una, dentro de un sobre.
     Cada una tiene "titulo" (opcional) y "texto". Puedes poner las que quieras. */
  razones: [
    { titulo:"Cómo me cuidas",       texto:"Eres tan atenta conmigo que me haces sentir cuidado, y eso no es poca cosa. Gracias por hacerlo, mi vida." },
    { titulo:"Tu cariño",            texto:"Eres tan cariñosa que hasta los días pesados se vuelven suaves cuando hablo contigo." },
    { titulo:"Lo que me dices",      texto:"Cuando me dices cosas lindas me las quedo todas. Me acompañan el resto del día." },
    { titulo:"Tus ojos",             texto:"Me encantan tus ojos. Y más cuando me miras: ahí se me olvida casi todo lo demás." },
    { titulo:"Tu sonrisa",           texto:"Tu sonrisa me arregla el día entero. Es de las cosas que más quiero seguir viendo." },
    { titulo:"Tu voz",               texto:"Tu voz me gusta muchísimo. Podría escucharte hablar de cualquier cosa y ya valdría la pena." },
    { titulo:"Tú, todita",           texto:"Y tu forma de ser, y todo lo demás. Sí, todo. Jajaja. Todo tú me gusta, Isa." }
  ],

  /* Ramos de rosas: se muestran de uno en uno, a pantalla completa.
     Cada ramo se puede personalizar por separado:
       titulo      → encabezado de la pantalla
       texto       → frase grande que aparece al abrirlo
       nota        → mensajito extra en una tarjeta (puede quedar vacío "")
       rosas       → cuántas rosas lleva (de 3 a 8)
       rosa/oscura/clara → colores de las rosas (principal, borde, centro)
       lazo        → color del moño
       papel       → color del papel de envoltura
       paniculata  → true para añadir florecitas blancas */
  ramos: [
    { titulo:"Por tu sonrisa", texto:"Una rosa por tu sonrisa…",
      nota:"Es de lo que más me gusta de ti, y de lo que más quiero seguir viendo.",
      rosas:7, rosa:"#e0245e", oscura:"#8a0f38", clara:"#ff7da1", lazo:"#f5c542", papel:"#fdf1e3", paniculata:true },
    { titulo:"Por tus ojos", texto:"…otra por tus ojos y por cómo me miras…",
      nota:"Hay miradas que lo dicen todo sin decir nada. La tuya es una de ellas.",
      rosas:5, rosa:"#ff6f9f", oscura:"#b0306a", clara:"#ffc0d6", lazo:"#ffffff", papel:"#ffe4ee", paniculata:true },
    { titulo:"Por cómo me cuidas", texto:"…otra por cómo me cuidas…",
      nota:"Lo noto, lo valoro y me hace muy feliz. Gracias, mi vida.",
      rosas:6, rosa:"#f4876e", oscura:"#a8452f", clara:"#ffc7b5", lazo:"#e0245e", papel:"#fff8ee", paniculata:false },
    { titulo:"Por todo lo demás", texto:"…y un ramo entero por todo lo demás.",
      nota:"Porque todo tú me gusta. Sí, todo.",
      rosas:8, rosa:"#a8143f", oscura:"#560820", clara:"#e0587e", lazo:"#f5c542", papel:"#2f2a3d", paniculata:true }
  ],
  mensajeRamos: "Ojalá algún día pueda regalártelos de verdad 🌹",

  /* Retos de rasca: van de menos a más difícil.
       secreto   → mensaje del primer reto (rascar la tarjeta)
       foto      → ruta de una foto de ustedes (ej. "img/nosotros.jpg"). Si queda vacío "", ese reto se omite.
       boleto    → intentos (raspaditas), corazones (cuántos debe encontrar) y premio
       linterna  → palabras escondidas en la oscuridad (juntas forman una frase) */
  rasca: {
    secreto: "Spoiler: me gustas muchísimo, Isa. Y se me da fatal guardar secretos 🙈",
    secretoExtra: "Y ahora que lo sabes… ¿sigues rascando? 😏",
    foto: "",
    fotoTexto: "Esta foto me encanta porque sales tú 🧡",
    boleto: { intentos: 5, corazones: 3, premio: "🎉 ¡Premio! Vale por una salida a donde tú elijas, con todo pagado y cero prisas." },
    linterna: { palabras: ["Contigo","hasta","los","días","grises","brillan"], mensaje: "Gracias por buscarlas con tanta paciencia 🧡" }
  },

  /* Frasco de mensajes: cada vez que lo toca, sale una nota al azar.
     "cuando" es opcional (aparece como "Para cuando…"). Puedes poner los mensajes que quieras. */
  frasco: {
    titulo: "El frasco de las cosas bonitas",
    subtitulo: "Cada vez que lo toques saldrá una nota. Saca las que quieras.",
    minimo: 6,        // cuántas notas debe sacar antes de poder continuar
    mensajes: [
      { cuando:"el día se ponga feo",         texto:"Respira, mi vida. Lo peor ya pasó, que es haberlo vivido. Y si quieres contármelo, aquí estoy, igual que tú siempre estás para mí." },
      { cuando:"tengas algo que celebrar",    texto:"Quiero ser el primero en enterarme. Y el segundo en pedir pastel." },
      { cuando:"estés aburrida",              texto:"Escríbeme. No prometo ser interesante, pero sí ser una distracción de calidad." },
      { cuando:"te acuerdes de mí",           texto:"Gracias por el pensamiento, Isa. Te aviso que es mutuo y bastante frecuente." },
      { cuando:"no puedas dormir",            texto:"Cuenta ovejas, o mejor cuenta las cosas lindas que me has dicho. Dudo que llegues al final." },
      { cuando:"estés estresada",             texto:"Una cosa a la vez, mi vida. Tú puedes con esto, y si no, lo hacemos juntos." },
      { cuando:"dudes de ti",                 texto:"Eres mucho más de lo que crees. Lo digo yo, que veo lo atenta y cariñosa que eres con quien quieres." },
      { cuando:"necesites una sonrisa",       texto:"Aquí tienes una: 🙂. Pero la tuya es mejor, que lo sepas." },
      { cuando:"tengas frío",                 texto:"Te mando un abrazo virtual, calentito y sin costo adicional." },
      { cuando:"quieras que te escriba",      texto:"No necesitas pedir permiso. Escríbeme a la hora que sea." },
      { cuando:"no sepas qué hacer",          texto:"Plan sugerido: algo rico para tomar y contarme todo. Yo me apunto." },
      { cuando:"leas esto otra vez",          texto:"Hola de nuevo. Sigo pensando lo mismo: me gustas muchísimo." },
      { cuando:"tengas hambre",               texto:"Dime qué se te antoja. Compartir comida contigo ya sería un buen plan." },
      { cuando:"extrañes a alguien",          texto:"Está bien extrañar. Y si por casualidad soy yo, mejor todavía." },
      { cuando:"algo te salga mal",           texto:"Un mal resultado no define lo buena que eres. Hoy toca descansar, y mañana vuelves con todo." },
      { cuando:"te sientas sola",             texto:"No lo estás. Aunque no estemos juntos, estoy a un mensaje de distancia." },
      { cuando:"estés enojada",               texto:"Está bien enojarse. Desahógate, y luego te escucho con toda la calma del mundo." },
      { cuando:"te mires al espejo",          texto:"Mírate bien: eso que ves es lo que yo veo, y sobre todo me encantan tus ojos y tu sonrisa." },
      { cuando:"llueva",                      texto:"Día perfecto para una manta, algo calentito y hablar contigo. Es mi plan favorito." },
      { cuando:"tengas una decisión difícil", texto:"Confía en tu instinto, que casi siempre acierta. Y si quieres otra opinión, aquí tienes la mía, sin compromiso." },
      { cuando:"sea lunes",                   texto:"Los lunes son menos horribles si alguien te desea buen día. Buen día, mi vida." },
      { cuando:"quieras reírte",              texto:"¿Qué le dice un jardinero a otro? «Disfrutemos mientras podamos». Sí, es malísimo, y ya me estoy riendo." },
      { cuando:"estés cansada",               texto:"Descansar también es avanzar. Hoy tienes permiso total para no hacer nada." },
      { cuando:"hayas logrado algo",          texto:"Estoy orgulloso de ti. Y te lo digo ahora porque a veces se me olvida decirlo en voz alta." },
      { cuando:"pienses que exagero",         texto:"Quizá un poco, pero cada palabra la digo en serio." },
      { cuando:"llegue la noche",             texto:"Que descanses. Y que sueñes algo bonito, a poder ser conmigo de invitado." },
      { cuando:"te despiertes",               texto:"Buenos días, Isa. Llegué antes que tu café a desearte un día increíble." },
      { cuando:"quieras un plan",             texto:"Te propongo un helado, una caminata y cero prisa. Tú eliges el día." },
      { cuando:"te preguntes si me importas", texto:"Muchísimo. Y este frasco entero es la prueba." },
      { cuando:"quieras otra nota más",       texto:"Siempre hay una más. Y si se acaban, las reescribo." }
    ]
  },

  /* La carta: un libro con hojas que se escriben solas.
     Dentro de cada "texto" puedes usar:
       {lo que escribe y tacha|lo que pone en su lugar}   → tachón y corrección
       [palabra|recuerdo]                                  → palabra subrayada que abre un recuerdo al tocarla
       [palabra|recuerdo|img/foto.jpg]                     → lo mismo, con una foto (opcional)
     Tip: cambia los 3 recuerdos de ejemplo por momentos reales de ustedes: ahí está lo más especial de la carta.
     cierre.pista → frase pequeña y tenue al final del libro que insinúa el secreto (la P.D. escondida en el bolsillo de la contracubierta).
     musica: ruta de un mp3 (ej. "audio/cancion.mp3"). Si queda vacío "", no aparece el botón de música. */
  carta: {
    saludo: "Hola, mi vida 🧡",
    paginas: [
      { titulo: "Lo que pienso",
        texto:
`Ya sé lo que estás pensando: «¿y esto a qué viene?». A nada en especial: ni cumpleaños, ni aniversario.

Nos conocíamos de antes, coincidíamos, y luego pasamos mucho tiempo sin hablarnos. Hasta que el [27 de septiembre|Después de tanto tiempo sin hablarnos, ese día te escribí. Un solo mensaje, y mira todo lo que cambió desde entonces. Hoy hace {{dias}} días.] te escribí, y desde entonces pienso en ti {un poco|bastante más de lo que admitiría}.

No somos nada oficial todavía, y lo tengo claro. Pero [tu sonrisa|Tu sonrisa me arregla el día entero. Es de las cosas que más quiero seguir viendo.] se me queda dando vueltas en la cabeza.` },
      { titulo: "Lo que siento",
        texto:
`Hoy puedo decirlo sin rodeos: {me gustas bastante|me gustas muchísimo}. Me gusta lo atenta que eres conmigo, cómo me cuidas y lo cariñosa que eres. Y cuando me dices cosas lindas, me las quedo todas.

Me encantan [tus ojos|Me encantan tus ojos. Y más cuando me miras: ahí se me olvida casi todo lo demás.], tu sonrisa, tu voz y la forma en que me miras. Podría seguir, pero ya sabes cómo termina la lista: todo tú, mi vida.` },
      { titulo: "Lo que quiero",
        texto:
`No quiero apurarte ni ponerte en una situación incómoda. Solo quiero {pedirte algo|que sepas lo que hay, sin vueltas}, y que todo siga a tu ritmo.

Lo único que quiero ahora es [quererte bien|Sin prisa y sin presión. Tú marcas el ritmo; yo solo quiero hacerlo bien.]: cuidarte como tú me cuidas a mí, escucharte y hacerte reír. Lo demás lo vamos viendo, poquito a poco.` }
    ],
    cierre: {
      titulo: "Fin… o casi",
      texto: "Esa es toda la carta. Gracias por leerla hasta el final, Isa 🧡",
      pista: "Dicen que los libros buenos guardan algo detrás de la última página…"
    },
    firma: "Con todo mi cariño",
    ps: { texto: "P.D.: si encontraste este bolsillo, es que eres de las que no se rinden. Eso también me gusta de ti. Ahora sí: respóndeme con calma, y con sinceridad." },
    musica: ""
  },

  /* El anillo de papel: una cajita de anillo cerrada con un mensaje encima; al abrirla el anillo queda dentro y sale cuando ella lo toca.
       mensajeCaja → lo que está escrito en la tapa
       textoAnillo → texto pequeño que va escrito sobre el anillo (ej. sus iniciales o una frase corta)
       textoAbierto → lo que aparece al abrirla (cuenta aquí la historia del anillo)
       alTocar → lo que aparece cuando ella toca el anillo */
  anillo: {
    paso: "Algo que ya es nuestro",
    titulo: "Nuestro anillo de papel",
    mensajeCaja: "Te lo prometí el día que me enseñaste «Paper Rings». Y yo cumplo lo que prometo.",
    pista: "Toca la cajita para abrirla 💍",
    pistaAnillo: "Toca el anillo para sacarlo ✨",
    textoAnillo: "Isa ✦ paper rings ✦ cielo",
    textoAbierto: "Un día me enseñaste «Paper Rings» y yo te dije que te iba a dar un anillo de papel. Es de papel y no vale nada… pero lo hice con todo el cariño del mundo.",
    alTocar: "Te queda perfecto, mi vida 🧡",
    boton: "Ir al calendario de adviento 🎄"
  },

  pregunta: "Si voy por buen camino… ¿me sigues dejando quererte? Es lo único que quiero ahora 🧡",
  textoSi: "Sí, sigue 🧡",
  textoNo: "Todavía no",
  respuestaSi: "Gracias por dejarme, mi vida. Prometo cuidar de esto, y de ti, con todo mi cariño 🧡",

  /* Calendario de adviento: del 1 al 24 de diciembre.
     Cada puerta se abre sola el día que corresponde. */
  adviento: [
    { emoji:"🎄", titulo:"Arranca diciembre", texto:"Se abre la primera puerta, Isa. A partir de hoy hay una sorpresa pequeña cada día. Vuelve todos los días, mi vida." },
    { emoji:"☕", titulo:"Vale por un chocolate caliente", texto:"Lugar y hora los eliges tú. Yo pago, escucho y comparto el malvavisco." },
    { emoji:"🎶", titulo:"Canción del día", texto:"Hoy te dedico «Paper Rings». Ya sabes por qué. Escúchala pensando en mí." },
    { emoji:"🔍", titulo:"Algo que admiro de ti", texto:"Admiro lo atenta que eres y cómo cuidas a quien quieres. A mí me tocó verlo de cerca, y no hay mejor suerte." },
    { emoji:"🍰", titulo:"Vale por un postre", texto:"El que quieras, del tamaño que quieras. Sin preguntas ni juicios." },
    { emoji:"🎬", titulo:"Noche de película", texto:"Tú eliges la película, yo pongo las palomitas. Prometo no hablar durante la escena importante (casi)." },
    { emoji:"💌", titulo:"Pregunta del día", texto:"¿Cuál es el recuerdo navideño que más te gusta? Cuéntamelo con detalles, quiero imaginarlo." },
    { emoji:"🤗", titulo:"Vale por un abrazo", texto:"De los largos. Válido en cualquier momento, sin fecha de vencimiento." },
    { emoji:"📸", titulo:"Mini reto", texto:"Mándame una foto de lo primero bonito que veas hoy. Sin trampas." },
    { emoji:"🌙", titulo:"Desafío de buenas noches", texto:"Hoy antes de dormir, piensa en una cosa buena que te pasó. Yo ya tengo la mía: tú." },
    { emoji:"✨", titulo:"Plan de luces", texto:"Vale por una salida a ver las luces navideñas de la ciudad, con algo calentito incluido." },
    { emoji:"🙈", titulo:"Confesión", texto:"El 27 de septiembre te escribí sin saber qué iba a pasar. Hoy sé que fue de las mejores decisiones del año." },
    { emoji:"🧡", titulo:"Tus ojos", texto:"Hoy toca decirlo otra vez: me encantan tus ojos. Y cómo me miras con ellos." },
    { emoji:"🎤", titulo:"Tu voz", texto:"Podría escucharte hablar horas. Hoy, si puedes, mándame un audio contándome algo cualquiera. Será mi canción favorita." },
    { emoji:"🌠", titulo:"Pide un deseo", texto:"Cierra los ojos, pide un deseo y no me lo digas. Yo también pedí uno, y ya sabes más o menos cuál es." },
    { emoji:"🧣", titulo:"Abrígate", texto:"Hace frío. Ponte algo calentito, que me importa que estés bien." },
    { emoji:"🎞️", titulo:"Sesión de fotos ridícula", texto:"Vale por una sesión de fotos con poses absurdas. Las mejores quedan guardadas como evidencia." },
    { emoji:"🍕", titulo:"Cena a tu elección", texto:"Eliges el sitio, la comida y hasta el postre. Yo solo llevo hambre y buena compañía." },
    { emoji:"⭐", titulo:"Tres cosas", texto:"Tres cosas que me gustan de ti hoy: tus ojos, tu sonrisa y lo cariñosa que eres." },
    { emoji:"📖", titulo:"Mini cuento", texto:"Había una vez dos personas que dejaron de hablarse, y un 27 de septiembre volvieron a hacerlo. El final lo escriben ellos." },
    { emoji:"🎧", titulo:"Playlist", texto:"Armé una playlist con canciones que me hacen pensar en ti. Pídemela y la escuchamos juntos." },
    { emoji:"🕰️", titulo:"Cuenta regresiva", texto:"Faltan tres días para Navidad, y yo ya estoy emocionado. Mitad por la fecha, mitad por ti." },
    { emoji:"🕯️", titulo:"Ya casi", texto:"Mañana es Nochebuena. Hoy solo quería decirte que me hace mucha ilusión verte." },
    { emoji:"🎁", titulo:"Nochebuena", texto:"Feliz Nochebuena, mi vida. Hay un regalo preparado para ti, de esos que se entregan en persona. Avísame cuándo nos vemos." }
  ]
};
