const products = [
  {
    name: "Iron Man & Thanos (Dual Pack)",
    beys: [
      { blade: "Iron Man", ratchet: "4-80", bit: "B" },
      { blade: "Thanos", ratchet: "4-60", bit: "P" },
    ],
  },
  {
    name: "Spider-Man & Venom (Dual Pack)",
    beys: [
      { blade: "Spider-Man", ratchet: "3-60", bit: "F" },
      { blade: "Venom", ratchet: "3-80", bit: "N" },
    ],
  },
  {
    name: "Optimus Prime & Megatron (Dual Pack)",
    beys: [
      { blade: "Optimus Prime", ratchet: "4-60", bit: "P" },
      { blade: "Megatron", ratchet: "4-80", bit: "B" },
    ],
  },
  {
    name: "Optimus Primal & Starscream (Dual Pack)",
    beys: [
      { blade: "Optimus Primal", ratchet: "3-60", bit: "F" },
      { blade: "Starscream", ratchet: "3-80", bit: "N" },
    ],
  },
  {
    name: "Mandolorian & Moff Gideon (Dual Pack)",
    beys: [
      { blade: "Mandolorian", ratchet: "3-80", bit: "F" },
      { blade: "Moff Gideon", ratchet: "3-80", bit: "N" },
    ],
  },
  {
    name: "Luke Skywalker & Darth Vader (Dual Pack)",
    beys: [
      { blade: "Luke Skywalker", ratchet: "4-80", bit: "B" },
      { blade: "Darth Vader", ratchet: "4-60", bit: "P" },
    ],
  },
  {
    name: "T-Rex & Mosasaurus (Dual Pack)",
    beys: [
      { blade: "T-Rex", ratchet: "1-80", bit: "GB" },
      { blade: "Mosasaurus", ratchet: "9-60", bit: "U" },
    ],
  },
  {
    name: "Spinosaurus & Quetzalcoatlus (Dual Pack)",
    beys: [
      { blade: "Spinosaurus", ratchet: "1-85", bit: "A" },
      { blade: "Quetzalcoatlus", ratchet: "4-55", bit: "D" },
    ],
  },
  {
    name: "X-Streme Stadium Starter Set",
    beys: [
      { blade: "Dagger Dran", ratchet: "4-60", bit: "R" },
      { blade: "Tusk Mammoth", ratchet: "3-60", bit: "T" },
    ],
  },
  {
    name: "Sword Dran (3-60F)",
    beys: [{ blade: "Sword Dran", ratchet: "3-60", bit: "F" }],
  },
  {
    name: "Helm Knight (3-80N)",
    beys: [{ blade: "Helm Knight", ratchet: "3-80", bit: "N" }],
  },
  {
    name: "Arrow Wizard (4-80B)",
    beys: [{ blade: "Arrow Wizard", ratchet: "4-80", bit: "B" }],
  },
  {
    name: "Scythe Incendio (4-60T)",
    beys: [{ blade: "Scythe Incendio", ratchet: "4-60", bit: "T" }],
  },
  {
    name: "Steel Samurai (4-80T)",
    beys: [{ blade: "Steel Samurai", ratchet: "4-80", bit: "T" }],
  },
  {
    name: "Horn Rhino (3-80S)",
    beys: [{ blade: "Horn Rhino", ratchet: "3-80", bit: "S" }],
  },
  {
    name: "Keel Shark (3-60LF)",
    beys: [{ blade: "Keel Shark", ratchet: "3-60", bit: "LF" }],
  },
  {
    name: "Talon Ptera (3-80B)",
    beys: [{ blade: "Talon Ptera", ratchet: "3-80", bit: "B" }],
  },
  {
    name: "Knife Shinobi & Keel Shark (Dual Pack)",
    beys: [
      { blade: "Knife Shinobi", ratchet: "4-80", bit: "HN" },
      { blade: "Keel Shark", ratchet: "3-80", bit: "F" },
    ],
  },
  {
    name: "Chain Incendio & Arrow Wizard (Dual Pack)",
    beys: [
      { blade: "Chain Incendio", ratchet: "5-60", bit: "HT" },
      { blade: "Arrow Wizard", ratchet: "4-60", bit: "N" },
    ],
  },
  {
    name: "Tail Viper & Sword Dran (Dual Pack)",
    beys: [
      { blade: "Tail Viper", ratchet: "5-80", bit: "O" },
      { blade: "Sword Dran", ratchet: "3-60", bit: "F" },
    ],
  },
  {
    name: "Soar Phoenix (String Launcher Set)",
    beys: [{ blade: "Soar Phoenix", ratchet: "9-60", bit: "GF" }],
  },
  {
    name: "Dranzer Spiral (Europa)",
    beys: [{ blade: "Dranzer Spiral", ratchet: "3-80", bit: "T" }],
  },
  {
    name: "Dranzer Spiral (USA/Australia)",
    beys: [{ blade: "Dranzer Spiral", ratchet: "3-80", bit: "T" }],
  },
  {
    name: "Lance Knight (4-80HN)",
    beys: [{ blade: "Lance Knight", ratchet: "4-80", bit: "HN" }],
  },
  {
    name: "Claw Leon (5-60P)",
    beys: [{ blade: "Claw Leon", ratchet: "5-60", bit: "P" }],
  },
  {
    name: "Sting Unicorn (5-60?)",
    beys: [{ blade: "Sting Unicorn", ratchet: "5-60", bit: "?" }],
  },
  {
    name: "Roar Tyranno (9-60GF)",
    beys: [{ blade: "Roar Tyranno", ratchet: "9-60", bit: "GF" }],
  },
  {
    name: "Scythe Incendio (3-80B)",
    beys: [{ blade: "Scythe Incendio", ratchet: "3-80", bit: "B" }],
  },
  {
    name: "Savage Bear (3-60S)",
    beys: [{ blade: "Savage Bear", ratchet: "3-60", bit: "S" }],
  },
  {
    name: "Yell Kong & Helm Knight (Dual Pack)",
    beys: [
      { blade: "Yell Kong", ratchet: "3-60", bit: "GB" },
      { blade: "Helm Knight", ratchet: "5-80", bit: "T" },
    ],
  },
  {
    name: "Bite Croc & Sting Unicorn (Dual Pack)",
    beys: [
      { blade: "Bite Croc", ratchet: "3-60", bit: "LF" },
      { blade: "Sting Unicorn", ratchet: "4-60", bit: "P" },
    ],
  },
  {
    name: "Gale Wyvern & Tail Viper (Dual Pack)",
    beys: [
      { blade: "Gale Wyvern", ratchet: "5-80", bit: "GB" },
      { blade: "Tail Viper", ratchet: "3-80", bit: "HN" },
    ],
  },
  {
    name: "Buster Dran UX (1-60A)",
    beys: [{ blade: "Buster Dran UX", ratchet: "1-60", bit: "A" }],
  },
  {
    name: "Wand Wizard UX (5-70DB)",
    beys: [{ blade: "Wand Wizard UX", ratchet: "5-70", bit: "DB" }],
  },
  {
    name: "Cowl Sphinx (9-80GN)",
    beys: [{ blade: "Cowl Sphinx", ratchet: "9-80", bit: "GN" }],
  },
  {
    name: "Arrow Wizard (4-80GB)",
    beys: [{ blade: "Arrow Wizard", ratchet: "4-80", bit: "GB" }],
  },
  {
    name: "Beat Tyranno & Knife Shinobi (Dual Pack)",
    beys: [
      { blade: "Beat Tyranno", ratchet: "4-70", bit: "Q" },
      { blade: "Knife Shinobi", ratchet: "4-80", bit: "HN" },
    ],
  },
  {
    name: "Gale Wyvern & Sword Dran (Dual Pack)",
    beys: [
      { blade: "Gale Wyvern", ratchet: "3-60", bit: "T" },
      { blade: "Sword Dran", ratchet: "3-80", bit: "B" },
    ],
  },
  {
    name: "Drop Attack Stadium Set",
    beys: [
      { blade: "Impact Drake", ratchet: "9-60", bit: "LF" },
      { blade: "Hover Wyvern", ratchet: "3-85", bit: "HN" },
    ],
  },
  {
    name: "Cobalt Dragoon (Starter Pack)",
    beys: [{ blade: "Cobalt Dragoon", ratchet: "2-60", bit: "C" }],
  },
  {
    name: "Buster Dran UX (5-70DB)",
    beys: [{ blade: "Buster Dran UX", ratchet: "5-70", bit: "DB" }],
  },
  {
    name: "Wand Wizard UX (1-60R)",
    beys: [{ blade: "Wand Wizard UX", ratchet: "1-60", bit: "R" }],
  },
  {
    name: "Hammer Incendio UX (3-70H)",
    beys: [{ blade: "Hammer Incendio UX", ratchet: "3-70", bit: "H" }],
  },
  {
    name: "Sterling Wolf UX (3-80FB)",
    beys: [{ blade: "Sterling Wolf UX", ratchet: "3-80", bit: "FB" }],
  },
  {
    name: "Shadow Shinobi UX (1-80MN)",
    beys: [{ blade: "Shadow Shinobi UX", ratchet: "1-80", bit: "MN" }],
  },
  {
    name: "Obsidian Shell (4-60D)",
    beys: [{ blade: "Obsidian Shell", ratchet: "4-60", bit: "D" }],
  },
  {
    name: "Yell Kong (3-60GB)",
    beys: [{ blade: "Yell Kong", ratchet: "3-60", bit: "GB" }],
  },
  {
    name: "Scarlet Garuda (4-70TP)",
    beys: [{ blade: "Scarlet Garuda", ratchet: "4-70", bit: "TP" }],
  },
  {
    name: "Soar Phoenix (5-80H)",
    beys: [{ blade: "Soar Phoenix", ratchet: "5-80", bit: "H" }],
  },
  {
    name: "Dagger Dran (4-70Q)",
    beys: [{ blade: "Dagger Dran", ratchet: "4-70", bit: "Q" }],
  },
  {
    name: "Keel Shark (1-60Q)",
    beys: [{ blade: "Keel Shark", ratchet: "1-60", bit: "Q" }],
  },
  {
    name: "Tide Whale (5-80E)",
    beys: [{ blade: "Tide Whale", ratchet: "5-80", bit: "E" }],
  },
  {
    name: "Pearl Tiger & Gill Shark (Dual Pack)",
    beys: [
      { blade: "Pearl Tiger", ratchet: "3-60", bit: "U" },
      { blade: "Gill Shark", ratchet: "4-70", bit: "O" },
    ],
  },
  {
    name: "Cowl Sphinx & Crest Leon (Dual Pack)",
    beys: [
      { blade: "Cowl Sphinx", ratchet: "1-80", bit: "GF" },
      { blade: "Crest Leon UX", ratchet: "7-60", bit: "GN" },
    ],
  },
  {
    name: "Courage Dran S CX (6-60V)",
    beys: [{ blade: "Courage Dran S", ratchet: "6-60", bit: "V" }],
  },
  {
    name: "Reaper Incendio T CX (4-70K)",
    beys: [{ blade: "Reaper Incendio T", ratchet: "4-70", bit: "K" }],
  },
  {
    name: "Arc Wizard R CX (4-55LO)",
    beys: [{ blade: "Arc Wizard R", ratchet: "4-55", bit: "LO" }],
  },
  {
    name: "Dark Perseus B CX (6-80W)",
    beys: [{ blade: "Dark Perseus B", ratchet: "6-80", bit: "W" }],
  },
];

const bladeSelect = document.getElementById("blade-select");
const ratchetSelect = document.getElementById("ratchet-select");
const bitSelect = document.getElementById("bit-select");
const form = document.getElementById("bey-form");
const results = document.getElementById("bey-results");

if (form && bladeSelect && ratchetSelect && bitSelect && results) {
  const blades = new Set();
  const ratchets = new Set();
  const bits = new Set();

  const beys = products.reduce((acc, product) => {
    product.beys.forEach((bey) => {
      acc.push({ ...bey, product: product.name });
    });
    return acc;
  }, []);

  beys.forEach((bey) => {
    blades.add(bey.blade);
    ratchets.add(bey.ratchet);
    bits.add(bey.bit);
  });

  const sortedBlades = Array.from(blades).sort((a, b) =>
    a.localeCompare(b, "it")
  );
  const sortedRatchets = Array.from(ratchets).sort((a, b) =>
    a.localeCompare(b, "it", { numeric: true })
  );
  const sortedBits = Array.from(bits).sort((a, b) => a.localeCompare(b, "it"));

  sortedBlades.forEach((blade) => {
    const option = document.createElement("option");
    option.value = blade;
    option.textContent = blade;
    bladeSelect.appendChild(option);
  });

  sortedRatchets.forEach((ratchet) => {
    const option = document.createElement("option");
    option.value = ratchet;
    option.textContent = ratchet;
    ratchetSelect.appendChild(option);
  });

  sortedBits.forEach((bit) => {
    const option = document.createElement("option");
    option.value = bit;
    option.textContent = bit === "?" ? "Non specificato" : bit;
    bitSelect.appendChild(option);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const blade = bladeSelect.value.trim();
    const ratchet = ratchetSelect.value.trim();
    const bit = bitSelect.value.trim();

    const candidates = beys.filter(
      (bey) =>
        bey.blade === blade || bey.ratchet === ratchet || bey.bit === bit
    );

    const comboKeys = new Set();
    const combos = [];

    const coversTarget = (combo) => ({
      blade: combo.some((bey) => bey.blade === blade),
      ratchet: combo.some((bey) => bey.ratchet === ratchet),
      bit: combo.some((bey) => bey.bit === bit),
    });

    const pushCombo = (combo) => {
      const key = combo
        .map((bey) => `${bey.blade}|${bey.ratchet}|${bey.bit}`)
        .sort()
        .join("||");
      if (!comboKeys.has(key)) {
        comboKeys.add(key);
        combos.push(combo);
      }
    };

    for (let i = 0; i < candidates.length; i += 1) {
      const one = [candidates[i]];
      const cover = coversTarget(one);
      if (cover.blade && cover.ratchet && cover.bit) {
        pushCombo(one);
      }
    }

    for (let i = 0; i < candidates.length; i += 1) {
      for (let j = i + 1; j < candidates.length; j += 1) {
        const two = [candidates[i], candidates[j]];
        const cover = coversTarget(two);
        if (cover.blade && cover.ratchet && cover.bit) {
          pushCombo(two);
        }
      }
    }

    for (let i = 0; i < candidates.length; i += 1) {
      for (let j = i + 1; j < candidates.length; j += 1) {
        for (let k = j + 1; k < candidates.length; k += 1) {
          const three = [candidates[i], candidates[j], candidates[k]];
          const cover = coversTarget(three);
          if (cover.blade && cover.ratchet && cover.bit) {
            pushCombo(three);
          }
        }
      }
    }

    combos.sort((a, b) => a.length - b.length);

    if (combos.length === 0) {
      results.innerHTML = `
        <h2>Risultato</h2>
        <p class="muted">Nessuna combinazione trovata con massimo 3 bey.</p>
      `;
      return;
    }

    const maxOptions = 8;
    const shown = combos.slice(0, maxOptions);
    const optionHtml = shown
      .map((combo, index) => {
        const items = combo
          .map(
            (bey) =>
              `<div class="result-pill">${bey.blade} (${bey.ratchet}${bey.bit})<span class="pill-note">Prodotto: ${bey.product}</span></div>`
          )
          .join("");
        return `
          <div class="result-combo">
            <p class="combo-title">Opzione ${index + 1} · ${combo.length} bey</p>
            <div class="result-list">${items}</div>
          </div>
        `;
      })
      .join("");

    const extraNote =
      combos.length > maxOptions
        ? `<p class="muted">Altre ${combos.length - maxOptions} opzioni disponibili.</p>`
        : "";

    results.innerHTML = `
      <h2>Risultato</h2>
      <p>Per ottenere <strong>${blade} ${ratchet}${bit}</strong> puoi comprare questi bey (max 3):</p>
      ${optionHtml}
      ${extraNote}
    `;
  });
}
