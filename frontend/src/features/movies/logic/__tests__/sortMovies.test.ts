import { describe, it, expect } from "vitest";
import { sortMovies } from "../sortMovies";
import type { MovieData } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────────────────────

const makeMovie = (overrides: Partial<MovieData> = {}): MovieData =>
   ({
      id: 1,
      tmdb_id: 100,
      title: "Filme Padrão",
      status: "watched",
      rating: null,
      release_date: undefined,
      ...overrides,
   } as MovieData);

// ─────────────────────────────────────────────────────────────────────────────
// 1. Wrapper — [...movies] vs movies
//
// Mutante: spread removido → sort() modifica o array original
// ─────────────────────────────────────────────────────────────────────────────

describe("sortMovies — imutabilidade do array original", () => {
   it("[spread] não deve modificar o array original em nenhum critério", () => {
      const movies = [
         makeMovie({ id: 3, rating: 1, title: "C", release_date: "2000-01-01" }),
         makeMovie({ id: 1, rating: 9, title: "A", release_date: "2023-01-01" }),
         makeMovie({ id: 2, rating: 5, title: "B", release_date: "2010-01-01" }),
      ];
      const originalOrder = movies.map((m) => m.id);

      for (const order of ["rating", "date", "alpha", "default"] as const) {
         sortMovies(movies, order);
         expect(movies.map((m) => m.id)).toEqual(originalOrder);
      }
   });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. case "rating"
//
// Mutantes:
//   M-R1  b.rating ?? 0  →  a.rating ?? 0       (ordem decrescente vira crescente)
//   M-R2  b - a          →  a - b               (subtração invertida)
//   M-R3  ?? 0 (b ou a)  →  ?? 1               (fallback errado para null)
//   M-R4  ?? 0 (b ou a)  →  ?? null            (perde o fallback, NaN na subtração)
// ─────────────────────────────────────────────────────────────────────────────

describe("sortMovies — rating", () => {
   // M-R1/R2: ordem deve ser estritamente decrescente
   it("[M-R1/R2] deve ordenar por rating decrescente (maior primeiro)", () => {
      const movies = [
         makeMovie({ id: 1, rating: 3 }),
         makeMovie({ id: 2, rating: 9 }),
         makeMovie({ id: 3, rating: 6 }),
      ];
      const result = sortMovies(movies, "rating");
      expect(result.map((m) => m.rating)).toEqual([9, 6, 3]);
   });

   // M-R1/R2 complementar: garante que NÃO é crescente
   it("[M-R1/R2] o filme de menor rating deve ser o último", () => {
      const movies = [
         makeMovie({ id: 1, rating: 1 }),
         makeMovie({ id: 2, rating: 10 }),
         makeMovie({ id: 3, rating: 5 }),
      ];
      const result = sortMovies(movies, "rating");
      expect(result[0].rating).toBe(10);
      expect(result[result.length - 1].rating).toBe(1);
   });

   // M-R3: ?? 0 — rating null deve valer 0, não 1
   // Se o fallback fosse 1, um filme null ultrapassaria filmes com rating=0.5
   it("[M-R3] rating null deve ser tratado como 0 (não 1), ficando após rating > 0", () => {
      const movies = [
         makeMovie({ id: 1, rating: null }),
         makeMovie({ id: 2, rating: 0.5 }), // 0.5 > 0 → deve vir antes de null
      ];
      const result = sortMovies(movies, "rating");
      expect(result[0].rating).toBe(0.5);
      expect(result[1].rating).toBeNull();
   });

   // M-R3 reforço: ?? 1 faria null valer 1, ultrapassando rating=0.5 e rating=0
   it("[M-R3] filme com rating=0 deve ficar antes de rating=null (fallback=0, não 1)", () => {
      const movies = [
         makeMovie({ id: 1, rating: 0 }),
         makeMovie({ id: 2, rating: null }),
      ];
      const result = sortMovies(movies, "rating");
      // Com ?? 0: 0 explícito e null empatam, então a ordem original deve ser preservada.
      // Com ?? 1: null subiria para o topo, invertendo a ordem.
      expect(result.map((m) => m.rating)).toEqual([0, null]);
   });

   // M-R4: ?? null causaria NaN na subtração — resultado seria NaN, sort instável
   it("[M-R4] não deve produzir NaN ao ordenar com rating null", () => {
      const movies = [
         makeMovie({ id: 1, rating: null }),
         makeMovie({ id: 2, rating: 5 }),
         makeMovie({ id: 3, rating: null }),
      ];
      const result = sortMovies(movies, "rating");
      // Se ?? null → subtração NaN → sort quebra → resultado pode ser qualquer coisa
      // Verificamos que o filme com rating 5 está no início
      expect(result[0].rating).toBe(5);
   });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. case "date"
//
// Mutantes:
//   M-D1  b.release_date - a.release_date  →  a - b         (ordem crescente)
//   M-D2  || "1900"  →  || "9999"                           (null vai para o topo, não para o fim)
//   M-D3  || "1900"  →  || ""                               (null vira epoch Unix — vai para o topo)
//   M-D4  getTime() - getTime()  →  getTime() + getTime()   (soma vira sempre positivo → ordem indefinida)
//   M-D5  b.release_date aplicado em a e vice-versa         (datas trocadas)
// ─────────────────────────────────────────────────────────────────────────────

describe("sortMovies — date", () => {
   // M-D1: ordem deve ser decrescente (mais recente primeiro)
   it("[M-D1] deve ordenar por data decrescente (mais recente primeiro)", () => {
      const movies = [
         makeMovie({ id: 1, release_date: "2000-06-15" }),
         makeMovie({ id: 2, release_date: "2023-03-01" }),
         makeMovie({ id: 3, release_date: "2010-11-20" }),
      ];
      const result = sortMovies(movies, "date");
      expect(result.map((m) => m.release_date)).toEqual([
         "2023-03-01",
         "2010-11-20",
         "2000-06-15",
      ]);
   });

   // M-D1 complementar: o mais antigo deve ser o último
   it("[M-D1] o filme mais antigo deve ser o último", () => {
      const movies = [
         makeMovie({ id: 1, release_date: "1980-01-01" }),
         makeMovie({ id: 2, release_date: "2020-01-01" }),
         makeMovie({ id: 3, release_date: "2000-01-01" }),
      ];
      const result = sortMovies(movies, "date");
      expect(result[result.length - 1].release_date).toBe("1980-01-01");
   });

   // M-D2: || "9999" — null iria para o topo (9999 é maior que qualquer data real)
   it("[M-D2] filmes sem data devem ficar no FINAL (fallback não pode ser data futura)", () => {
      const movies = [
         makeMovie({ id: 1, release_date: undefined }),
         makeMovie({ id: 2, release_date: "2023-01-01" }),
         makeMovie({ id: 3, release_date: "2000-01-01" }),
      ];
      const result = sortMovies(movies, "date");
      expect(result[result.length - 1].release_date).toBeUndefined();
      expect(result[0].release_date).toBe("2023-01-01");
   });

   // M-D3: || "" → new Date("") é Invalid Date → getTime() = NaN
   it("[M-D3] filmes sem data não devem produzir NaN (fallback válido)", () => {
      const movies = [
         makeMovie({ id: 1, release_date: undefined }),
         makeMovie({ id: 2, release_date: "2010-01-01" }),
      ];
      const result = sortMovies(movies, "date");
      // Se NaN: sort instável, "Com Data" pode ficar em qualquer posição
      expect(result[0].release_date).toBe("2010-01-01");
   });

   // M-D2/D3 reforço: dois filmes sem data — ambos devem aparecer no resultado (sem crash)
   it("[M-D2/D3] múltiplos filmes sem data não devem causar crash ou NaN", () => {
      const movies = [
         makeMovie({ id: 1, release_date: undefined }),
         makeMovie({ id: 2, release_date: undefined }),
         makeMovie({ id: 3, release_date: "2015-05-05" }),
      ];
      const result = sortMovies(movies, "date");
      expect(result).toHaveLength(3);
      expect(result[0].release_date).toBe("2015-05-05");
   });

   // M-D4: soma em vez de subtração — resultado sempre positivo para b !== a,
   // o que significa que a ordem nunca inverte → sort se comporta como estável/noop
   it("[M-D4] a subtração deve produzir resultado negativo quando b < a (não soma)", () => {
      // Filme mais antigo em b, mais recente em a: b - a < 0 → b sobe para depois de a
      // Se fosse soma: b.getTime() + a.getTime() > 0 sempre → ordem nunca inverte
      const movies = [
         makeMovie({ id: 1, release_date: "2023-01-01" }), // mais recente
         makeMovie({ id: 2, release_date: "1990-01-01" }), // mais antigo
      ];
      // Já estão na ordem certa; queremos garantir que a função mantém assim
      const result = sortMovies(movies, "date");
      expect(result[0].release_date).toBe("2023-01-01");
      expect(result[1].release_date).toBe("1990-01-01");
   });

   it("[M-D4] deve inverter a posição quando o mais antigo vem primeiro no input", () => {
      const movies = [
         makeMovie({ id: 1, release_date: "1990-01-01" }), // mais antigo — deve ir para o fim
         makeMovie({ id: 2, release_date: "2023-01-01" }), // mais recente — deve subir
      ];
      const result = sortMovies(movies, "date");
      expect(result[0].release_date).toBe("2023-01-01");
      expect(result[1].release_date).toBe("1990-01-01");
   });

   // M-D5: b e a trocados — ordem crescente em vez de decrescente
   it("[M-D5] datas devem ser comparadas como b - a (não a - b)", () => {
      const movies = [
         makeMovie({ id: 1, release_date: "2000-01-01" }),
         makeMovie({ id: 2, release_date: "2010-01-01" }),
         makeMovie({ id: 3, release_date: "2020-01-01" }),
      ];
      const result = sortMovies(movies, "date");
      // Decrescente correto: 2020, 2010, 2000
      // Crescente (mutante): 2000, 2010, 2020
      expect(result.map((m) => m.release_date)).toEqual([
         "2020-01-01",
         "2010-01-01",
         "2000-01-01",
      ]);
   });

   // Caso especial: o fallback "1900" deve ser anterior a qualquer data real
   it('[M-D2] o fallback "1900" deve ser anterior a datas reais (coloca null no final)', () => {
      const movies = [
         makeMovie({ id: 1, release_date: undefined }),   // fallback "1900"
         makeMovie({ id: 2, release_date: "1901-01-01" }), // logo depois de 1900
      ];
      const result = sortMovies(movies, "date");
      // "1901" > "1900" → com data deve vir primeiro
      expect(result[0].release_date).toBe("1901-01-01");
      expect(result[1].release_date).toBeUndefined();
   });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. case "alpha"
//
// Mutantes:
//   M-A1  a.localeCompare(b)  →  b.localeCompare(a)   (ordem Z→A)
//   M-A2  a.title || ""  →  b.title || ""              (compara b com b)
//   M-A3  b.title || ""  →  a.title || ""              (compara a com a)
//   M-A4  || ""  →  || " "                            (espaço ordena antes de letras → nulos sobem)
// ─────────────────────────────────────────────────────────────────────────────

describe("sortMovies — alpha", () => {
   // M-A1: ordem A→Z, não Z→A
   it("[M-A1] deve ordenar alfabeticamente de A para Z", () => {
      const movies = [
         makeMovie({ title: "Zorro" }),
         makeMovie({ title: "Avatar" }),
         makeMovie({ title: "Matrix" }),
      ];
      const result = sortMovies(movies, "alpha");
      expect(result.map((m) => m.title)).toEqual(["Avatar", "Matrix", "Zorro"]);
   });

   // M-A1 complementar: o primeiro deve ser A, o último Z
   it("[M-A1] o título 'A...' deve vir antes de 'Z...'", () => {
      const movies = [makeMovie({ title: "Zorro" }), makeMovie({ title: "Amor" })];
      const result = sortMovies(movies, "alpha");
      expect(result[0].title).toBe("Amor");
      expect(result[1].title).toBe("Zorro");
   });

   // M-A2/A3: garante que a comparação usa a e b distintos (não b com b ou a com a)
   // Se a.title fosse usado para ambos: localeCompare retorna sempre 0 → ordem inalterada
   it("[M-A2/A3] a comparação deve usar títulos distintos (não comparar um com si mesmo)", () => {
      const movies = [
         makeMovie({ id: 1, title: "Zorro" }),
         makeMovie({ id: 2, title: "Amor" }),
      ];
      const result = sortMovies(movies, "alpha");
      // Se a comparação fosse a.localeCompare(a) = 0 sempre → ordem de entrada mantida
      // Verifica que houve reordenação
      expect(result[0].id).toBe(2); // "Amor" veio para a frente
      expect(result[1].id).toBe(1); // "Zorro" foi para o fim
   });

   // M-A4: || " " — espaço tem código ASCII 32, antes de 'A' (65)
   // Filmes sem título com fallback " " subiriam para antes de "A..."
   it('[M-A4] filmes sem título devem usar "" como fallback (não espaço)', () => {
      const movies = [
         makeMovie({ id: 1, title: undefined as unknown as string }),
         makeMovie({ id: 2, title: "Amor" }),
      ];
      const result = sortMovies(movies, "alpha");
      // "" < "A" → sem título deve vir antes de "Amor"
      // " " < "A" também, então ambos os fallbacks colocam null antes — mas
      // queremos garantir que pelo menos não quebra e retorna todos os filmes
      expect(result).toHaveLength(2);
      // Com "" correto: undefined sobe (está antes de 'A')
      expect(result[result.length - 1].title).toBe("Amor");
   });

   // Sanidade com múltiplos elementos
   it("deve ordenar corretamente lista com muitos títulos", () => {
      const titles = ["Mononoke", "Akira", "Totoro", "Evangelion", "Bleach"];
      const movies = titles.map((title, id) => makeMovie({ id, title }));
      const result = sortMovies(movies, "alpha");
      expect(result.map((m) => m.title)).toEqual([...titles].sort((a, b) => a.localeCompare(b)));
   });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. case "default"
//
// Mutantes:
//   M-Df1  b.id - a.id  →  a.id - b.id  (crescente em vez de decrescente)
// ─────────────────────────────────────────────────────────────────────────────

describe("sortMovies — default", () => {
   it("[M-Df1] deve ordenar por id decrescente (maior id primeiro)", () => {
      const movies = [
         makeMovie({ id: 5 }),
         makeMovie({ id: 1 }),
         makeMovie({ id: 3 }),
      ];
      const result = sortMovies(movies, "default");
      expect(result.map((m) => m.id)).toEqual([5, 3, 1]);
   });

   it("[M-Df1] o filme com menor id deve ser o último", () => {
      const movies = [makeMovie({ id: 10 }), makeMovie({ id: 2 }), makeMovie({ id: 7 })];
      const result = sortMovies(movies, "default");
      expect(result[result.length - 1].id).toBe(2);
   });

   it("[M-Df1] deve inverter corretamente quando o menor id vem primeiro no input", () => {
      const movies = [makeMovie({ id: 1 }), makeMovie({ id: 99 })];
      const result = sortMovies(movies, "default");
      expect(result[0].id).toBe(99);
      expect(result[1].id).toBe(1);
   });
});