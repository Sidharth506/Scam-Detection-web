const safeList = [
  "google", "google.com",
  "facebook", "facebook.com",
  "instagram", "instagram.com",
  "whatsapp", "whatsapp.com",
  "amazon", "amazon.com",
  "flipkart", "flipkart.com",
  "phonepe", "phonepe.com",
  "paytm", "paytm.com",
  "truecaller", "truecaller.com",
  "sbi", "sbi.com",
  "hdfcbank", "hdfcbank.com",
  "icicibank", "icicibank.com",
  "zomato", "zomato.com",
  "swiggy", "swiggy.com",
  "ola", "ola.com",
  "uber", "uber.com",
  "hotstar", "hotstar.com",
  "netflix", "netflix.com",
  "airtel", "airtel.com",
  "snapchat", "snapchat.com",
  "jio", "jio.com"
];

const API_KEY = "AIzaSyAm6Hj5km2PAPpFU-5b5kh2G4hnn4UzH_k";

function levenshtein(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () => []);
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + 1
        );
      }
    }
  }
  return matrix[a.length][b.length];
}

async function checkInput() {
  let input = document.getElementById("userInput").value.trim().toLowerCase();

  // 🔧 Normalize input: remove http(s) and trailing slash
  input = input.replace(/^https?:\/\//, '');
  input = input.replace(/\/$/, '');

  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "Checking... 🔍";

  const closest = safeList.map(safe => ({
    name: safe,
    distance: levenshtein(input, safe)
  })).sort((a, b) => a.distance - b.distance)[0];

  let fuzzyResult = "unknown";
  if (closest.distance === 0) fuzzyResult = "safe";
  else if (closest.distance <= 2) fuzzyResult = "dangerous";

  if (input.includes(".")) {
    const isSafe = await checkWithGoogleSafeBrowsing(input);
    if (!isSafe) {
      resultDiv.innerHTML = `<span class='text-red-600'>🚨 Unsafe according to Google Safe Browsing!</span>`;
      return;
    }
  }

  if (fuzzyResult === "safe") {
    resultDiv.innerHTML = `<span class='text-green-600'>✅ Safe! Matches trusted name (${closest.name})</span>`;
  } else if (fuzzyResult === "dangerous") {
    resultDiv.innerHTML = `<span class='text-red-600'>⚠️ Dangerous! Looks similar to ${closest.name}</span>`;
  } else {
    resultDiv.innerHTML = `<span class='text-yellow-600'>❓ Unknown. Proceed with caution.</span>`;
  }
}

async function checkWithGoogleSafeBrowsing(url) {
  const body = {
    client: { clientId: "yourcompany", clientVersion: "1.5.2" },
    threatInfo: {
      threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [{ url }]
    }
  };

  try {
    const res = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`,
      {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" }
      }
    );
    const data = await res.json();
    return Object.keys(data).length === 0;
  } catch (e) {
    console.error("Safe Browsing API error", e);
    return true; // Assume safe if error
  }
}
