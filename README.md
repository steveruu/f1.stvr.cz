# 🏎️ f1.stvr.cz

Moderní webová aplikace pro sledování aktuálních výsledků, pořadí jezdců a týmů v šampionátu Formule 1. Aplikace je postavena s využitím moderních technologií a zaměřuje se na rychlost a přehlednost.

## 🔧 Klíčové vlastnosti

* 🏁 **Výsledky závodů:** Detailní výsledky všech Velkých cen.
* 🏆 **Pořadí šampionátu:** Aktuální pořadí jezdců a konstruktérů.
* 📱 **Responzivní design:** Pohodlné zobrazení na počítačích, tabletech i mobilních telefonech.
* ⚙️ **PWA (Progressive Web App):** Možnost instalace aplikace pro rychlý přístup a částečnou offline funkcionalitu.
* 📊 **Statistiky a grafy:** Vizuální znázornění dat pomocí grafů (využívá Recharts).

## 💻 Použité technologie

* **Frontend Framework:** React (v18) s Vite
* **Jazyk:** TypeScript
* **Stylování:** Tailwind CSS
* **UI Komponenty:** Shadcn/ui, Lucide Icons
* **Routing:** React Router DOM (v6)
* **Správa stavu & Data Fetching:** TanStack Query (React Query v5)
* **Formuláře:** React Hook Form (v7) se Zod pro validaci
* **Utility:** date-fns, clsx, tailwind-merge
* **Vývojové nástroje:** ESLint, Prettier (předpoklad, doporučeno)
* **Build Tool:** Vite

## 🧠 Instalace a spuštění

### Předpoklady

* [Node.js](https://nodejs.org/) (doporučená verze LTS)
* [Bun](https://bun.sh/) (preferovaný správce balíčků, viz `bun.lockb`)

### Kroky

1. **Klonování repozitáře:**
  
    ```bash
    git clone https://github.com/steveruu/f1.stvr.cz.git
    cd f1.stvr.cz
    ```

2. **Instalace závislostí:**
    Pokud používáte `bun`:

    ```bash
    bun install
    ```

    Alternativně pomocí `npm`:

    ```bash
    npm install
    ```

    Nebo `yarn`:

    ```bash
    yarn install

    ```

3. **Spuštění vývojového serveru:**
    Pomocí `bun`:

    ```bash
    bun run dev
    ```

    Alternativně pomocí `npm`:

    ```bash
    npm run dev
    ```

    Aplikace by měla být dostupná na adrese `http://localhost:5173` (výchozí port pro Vite).

4. **Sestavení (build) pro produkci:**
    Pomocí `bun`:

    ```bash
    bun run build
    ```

    Alternativně pomocí `npm`:

    ```bash
    npm run build
    ```

    Výstup bude ve složce `dist`.

5. **Linting:**
    Pomocí `bun`:

    ```bash
    bun run lint
    ```

    Alternativně pomocí `npm`:

    ```bash
    npm run lint
    ```

## 📂 Struktura projektu

Přehled hlavních adresářů a souborů:

```text
f1.stvr.cz/
├── public/             # Statické soubory (ikony, obrázky, manifest.json)
├── src/                # Zdrojový kód aplikace
│   ├── app/            # Hlavní části aplikace (např. stránky, rozložení)
│   │   ├── races/      # Komponenty a logika pro výsledky závodů
│   │   └── standings/  # Komponenty a logika pro pořadí
│   ├── components/     # Opakovaně použitelné UI komponenty
│   │   └── ui/         # Komponenty ze Shadcn/ui
│   ├── hooks/          # Vlastní React hooky
│   ├── lib/            # Utility, pomocné funkce (např. date-fns konfigurace)
│   ├── pages/          # Komponenty pro jednotlivé stránky (použito s React Router)
│   ├── services/       # Služby pro komunikaci s API, správa dat
│   └── main.tsx        # Vstupní bod aplikace
├── .env.example        # Příklad konfiguračního souboru pro proměnné prostředí
├── bun.lockb           # Zámkový soubor pro Bun
├── package.json        # Seznam závislostí a skriptů
├── vite.config.ts      # Konfigurace Vite
├── tailwind.config.ts  # Konfigurace Tailwind CSS
├── tsconfig.json       # Konfigurace TypeScriptu
└── README.md           # Tento soubor
```

## Přispívání

Pokud máte zájem přispět k vývoji, prosím, vytvořte Pull Request nebo Issue na GitHubu.

## Licence

Tento projekt je distribuován pod licencí [GPLv3](https://www.gnu.org/licenses/gpl-3.0.html).

---

Vytvořeno s ❤️ pro fanoušky Formule 1.
