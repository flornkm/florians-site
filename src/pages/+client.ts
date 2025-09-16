function logEasterEgg() {
  const styleBig = `
    color: #fff;
    font-size: 20px;
    font-weight: medium;
    margin-top: 10px;
    margin-bottom: 10px;
  `;

  const styleSmall = `
    color: #a3a3a3;
    font-size: 12px;
    margin-top: 10px;
    margin-bottom: 10px;
  `;

  console.log(
    `%cPersonal Site of Florian %cThanks for visiting my place of the internet. If you're seeing this you're probably a programmer (or a bot).
Feel free to send me a screenshot of your console so I know someone found this easter egg.`,
    styleBig,
    styleSmall,
  );
}

logEasterEgg();
