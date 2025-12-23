function play(user) {
  const choices = ["Stone", "Paper", "Scissors"];
  const cpu = choices[Math.floor(Math.random()*3)];
  let result = "";

  if(user === cpu) result = "Draw!";
  else if(
    (user==="Stone" && cpu==="Scissors") ||
    (user==="Paper" && cpu==="Stone") ||
    (user==="Scissors" && cpu==="Paper")
  ) result = "You Win!";
  else result = "You Lose!";

  document.getElementById("result").innerText =
    `You: ${user} | Computer: ${cpu} → ${result}`;
}

