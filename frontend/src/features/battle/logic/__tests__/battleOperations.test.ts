import { describe, it, expect, vi } from "vitest";
import { shuffleArray, filterMoviesByCriteria, setupTournament, nextPowerOfTwo } from "../battleOperations";
import type { MovieData } from "@/types";

function makeMovies(
   ratings: (number | null)[],
   extras: Partial<MovieData> = {}
): MovieData[] {
   return ratings.map(
      (rating, i) =>
         ({
            id: i,
            title: `Filme ${i}`,
            status: "watched",
            isOscar: false,
            isNational: false,
            rating,
            ...extras,
         } as MovieData)
   );
}

function allParticipants(result: { fighters: MovieData[]; byes: MovieData[] }) {
   return [...result.fighters, ...result.byes];
}

describe("shuffleArray", () => {
   // M1-A: conta chamadas do Math.random — com i >= 0 seriam length chamadas, não length-1
   it("[M1-A] deve chamar Math.random exatamente (length - 1) vezes", () => {
      const spy = vi.spyOn(Math, "random").mockReturnValue(0.5);
      shuffleArray([1, 2, 3, 4]); 
      expect(spy).toHaveBeenCalledTimes(3);
      spy.mockRestore();
   });

   // M1-D / M1-F: verifica que j pode assumir valores iguais a i (sem i+1, não consegue)
   it("[M1-D/F] deve permitir que qualquer posição troque com ela mesma (j pode = i)", () => {
      // Math.random() → 0.99... → j = floor(0.99 * (i+1)) = i quando possível
      const spy = vi.spyOn(Math, "random").mockReturnValue(0.9999);
      const result = shuffleArray([10, 20, 30]);
      // Com i+1 correto e random≈1: j=i em todas as iterações → array inalterado
      expect(result).toEqual([10, 20, 30]);
      spy.mockRestore();
   });

   // M1-G: garante que a troca de posição realmente ocorre
   it("[M1-G] deve reposicionar elementos quando Math.random produz j diferente de i", () => {
      // i=1, random=0 → j=0: espera troca entre índices 0 e 1
      const spy = vi.spyOn(Math, "random").mockReturnValue(0);
      // Array [A, B, C]: i=2 j=0→swap(2,0)=[C,B,A]; i=1 j=0→swap(1,0)=[B,C,A]
      const result = shuffleArray(["A", "B", "C"]);
      expect(result).toEqual(["B", "C", "A"]);
      spy.mockRestore();
   });

   // Sanidade: não modifica original e mantém todos os elementos
   it("não deve modificar o array original", () => {
      const original = [1, 2, 3, 4, 5];
      const copy = [...original];
      shuffleArray(original);
      expect(original).toEqual(copy);
   });

   it("deve retornar array com os mesmos elementos sem duplicatas", () => {
      const original = [10, 20, 30, 40, 50];
      const result = shuffleArray(original);
      expect(result.sort()).toEqual([...original].sort());
   });

   it("deve retornar array vazio se receber array vazio", () => {
      expect(shuffleArray([])).toEqual([]);
   });

   it("deve retornar array de um elemento sem modificação", () => {
      expect(shuffleArray([42])).toEqual([42]);
   });
});

describe("nextPowerOfTwo", () => {
   // M2-A: n=0 deve retornar 0, não tentar log2(0) = -Infinity
   it("[M2-A] deve retornar 0 para n=0 (guarda n <= 0 cobre o zero)", () => {
      expect(nextPowerOfTwo(0)).toBe(0);
   });

   // M2-B: negativos devem retornar 0
   it("[M2-B] deve retornar 0 para qualquer n negativo", () => {
      expect(nextPowerOfTwo(-1)).toBe(0);
      expect(nextPowerOfTwo(-100)).toBe(0);
   });

   // M2-C/D: valores positivos nunca devem retornar 0
   it("[M2-C/D] deve retornar valor > 0 para qualquer n positivo", () => {
      expect(nextPowerOfTwo(1)).toBeGreaterThan(0);
      expect(nextPowerOfTwo(7)).toBeGreaterThan(0);
   });

   // M2-E: retorno do sad path é exatamente 0, não 1
   it("[M2-E] deve retornar exatamente 0 (não 1) para n <= 0", () => {
      expect(nextPowerOfTwo(0)).toBe(0);
      expect(nextPowerOfTwo(-5)).toBe(0);
   });

   // M2-F: Math.ceil vs Math.floor — n que já é potência de 2 deve retornar ele mesmo
   it("[M2-F] deve retornar o próprio n quando ele já é potência de 2", () => {
      expect(nextPowerOfTwo(1)).toBe(1);
      expect(nextPowerOfTwo(2)).toBe(2);
      expect(nextPowerOfTwo(4)).toBe(4);
      expect(nextPowerOfTwo(8)).toBe(8);
      expect(nextPowerOfTwo(16)).toBe(16);
   });

   // M2-F/G/H: n não-potência deve arredondar para CIMA, não para baixo nem errar
   it("[M2-F/G/H] deve arredondar para a próxima potência de 2 acima", () => {
      expect(nextPowerOfTwo(3)).toBe(4); 
      expect(nextPowerOfTwo(5)).toBe(8);
      expect(nextPowerOfTwo(6)).toBe(8);
      expect(nextPowerOfTwo(7)).toBe(8);  
      expect(nextPowerOfTwo(9)).toBe(16);  
      expect(nextPowerOfTwo(12)).toBe(16);
      expect(nextPowerOfTwo(100)).toBe(128);
   });

   // M2-H: log2 vs log — log2(8)=3, log(8)≈2.08; resultados diferentes
   it("[M2-H] deve funcionar corretamente com log2 (não log natural)", () => {
      expect(nextPowerOfTwo(32)).toBe(32);
      expect(nextPowerOfTwo(33)).toBe(64);
   });
});


describe("filterMoviesByCriteria", () => {
   const movies: MovieData[] = [
      { id: 1, title: "Watched+Rating+Oscar",    status: "watched",   isOscar: true,  isNational: false, rating: 8 },
      { id: 2, title: "Watched+Rating+National", status: "watched",   isOscar: false, isNational: true,  rating: 6 },
      { id: 3, title: "Watched+Rating+None",     status: "watched",   isOscar: false, isNational: false, rating: 7 },
      { id: 4, title: "Watched+NoRating",        status: "watched",   isOscar: true,  isNational: true,  rating: null },
      { id: 5, title: "Watchlist+Rating",        status: "watchlist", isOscar: true,  isNational: true,  rating: 9 },
      { id: 6, title: "Watchlist+NoRating",      status: "watchlist", isOscar: false, isNational: false, rating: null },
   ] as MovieData[];

   it("[M3-A] não deve incluir filmes com status 'watchlist'", () => {
      const result = filterMoviesByCriteria(movies, "random");
      const ids = result.map((m) => m.id);
      expect(ids).not.toContain(5); 
      expect(ids).not.toContain(6); 
   });

   it("[M3-C] não deve incluir filmes watched com rating null", () => {
      const result = filterMoviesByCriteria(movies, "random");
      const ids = result.map((m) => m.id);
      expect(ids).not.toContain(4); 
   });

   it("[M3-E] deve incluir apenas filmes que são watched E têm rating (não basta um)", () => {
      const result = filterMoviesByCriteria(movies, "random");
      expect(result.every((m) => m.status === "watched" && m.rating !== null)).toBe(true);
   });

   it("[M3-B/D] deve incluir todos os filmes watched com rating", () => {
      const result = filterMoviesByCriteria(movies, "random");
      const ids = result.map((m) => m.id);
      expect(ids).toContain(1);
      expect(ids).toContain(2);
      expect(ids).toContain(3);
      expect(result).toHaveLength(3);
   });

   it("[M3-F] critério 'oscar' deve retornar apenas filmes com isOscar=true", () => {
      const result = filterMoviesByCriteria(movies, "oscar");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(result.every((m) => m.isOscar === true)).toBe(true);
   });

   it("[M3-F] critério 'national' deve retornar apenas filmes com isNational=true", () => {
      const result = filterMoviesByCriteria(movies, "national");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2);
      expect(result.every((m) => m.isNational === true)).toBe(true);
   });

   it("critérios 'oscar' e 'national' devem retornar conjuntos distintos", () => {
      const oscar = filterMoviesByCriteria(movies, "oscar").map((m) => m.id);
      const national = filterMoviesByCriteria(movies, "national").map((m) => m.id);
      expect(oscar).not.toEqual(national);
   });
});

describe("setupTournament — guarda de mínimo", () => {
   it("[M4-A] não deve lançar erro com exatamente 2 filmes", () => {
      const movies = makeMovies([5, 7]);
      expect(() => setupTournament(movies, "random", 2)).not.toThrow();
   });

   it("[M4-B] deve lançar erro com 1 filme", () => {
      const movies = makeMovies([5]);
      expect(() => setupTournament(movies, "random", 2)).toThrowError("Mínimo de 2 filmes necessários");
   });

   it("[M4-B] deve lançar erro com 0 filmes", () => {
      expect(() => setupTournament([], "random", 2)).toThrowError("Mínimo de 2 filmes necessários");
   });

   it("[M4-C] não deve lançar erro com 3 ou mais filmes", () => {
      const movies = makeMovies([1, 2, 3]);
      expect(() => setupTournament(movies, "random", 3)).not.toThrow();
   });
});

describe("setupTournament — lógica de quantity", () => {
   it("[M5-A/B/C] quantity=-1 deve selecionar todos os filmes disponíveis", () => {
      const movies = makeMovies([1, 2, 3, 4, 5, 6]);
      const result = setupTournament(movies, "random", -1);
      const total = allParticipants(result).length;
      expect(total).toBe(6);
   });

   it("[M5-A] quantity positivo deve limitar a seleção, não usar todos", () => {
      const movies = makeMovies([1, 2, 3, 4, 5, 6]);
      const result = setupTournament(movies, "random", 4);
      const total = allParticipants(result).length;
      expect(total).toBe(4);
   });


   it("[M5-D] não deve selecionar mais filmes que o total disponível (Math.min)", () => {
      const movies = makeMovies([1, 2, 3]); 
      const result = setupTournament(movies, "random", 10); 
      const total = allParticipants(result).length;
      expect(total).toBe(3); 
   });

   it("[M5-D] quantity menor que o total deve limitar corretamente", () => {
      const movies = makeMovies([1, 2, 3, 4, 5]);
      const result = setupTournament(movies, "random", 3);
      expect(allParticipants(result)).toHaveLength(3);
   });
});

describe("setupTournament — ordenação", () => {
   it("[M6-A/B] top_rated deve selecionar os filmes de maior rating", () => {
      const movies = makeMovies([1, 3, 5, 7, 9]);
      const result = setupTournament(movies, "top_rated", 3);
      const ratings = allParticipants(result).map((m) => m.rating);
      expect(ratings).toContain(9);
      expect(ratings).toContain(7);
      expect(ratings).toContain(5);
      expect(ratings).not.toContain(1);
      expect(ratings).not.toContain(3);
   });

   it("[M6-C] worst_rated deve selecionar os filmes de menor rating", () => {
      const movies = makeMovies([1, 3, 5, 7, 9]);
      const result = setupTournament(movies, "worst_rated", 3);
      const ratings = allParticipants(result).map((m) => m.rating);
      expect(ratings).toContain(1);
      expect(ratings).toContain(3);
      expect(ratings).toContain(5);
      expect(ratings).not.toContain(7);
      expect(ratings).not.toContain(9);
   });

   it("[M6-A/C] top_rated e worst_rated devem selecionar conjuntos opostos", () => {
      const movies = makeMovies([2, 4, 6, 8]);
      const top = allParticipants(setupTournament(movies, "top_rated", 2)).map((m) => m.rating).sort();
      const worst = allParticipants(setupTournament(movies, "worst_rated", 2)).map((m) => m.rating).sort();
      expect(top).toEqual([6, 8]);
      expect(worst).toEqual([2, 4]);
   });

   it("[M6-D] recent deve selecionar os filmes com maior id", () => {
      const movies = makeMovies([5, 5, 5, 5, 5]); 
      const result = setupTournament(movies, "recent", 2);
      const ids = allParticipants(result).map((m) => m.id);
      expect(ids).toContain(4);
      expect(ids).toContain(3);
      expect(ids).not.toContain(0);
   });

   it("[M6-D] recent não deve incluir o filme mais antigo quando quantity < total", () => {
      const movies = makeMovies([5, 5, 5, 5, 5]);
      const result = setupTournament(movies, "recent", 4);
      const ids = allParticipants(result).map((m) => m.id);
      expect(ids).not.toContain(0);
   });
});

describe("setupTournament — cálculo de bracket, fighters e byes", () => {
   it("[M7-A/B] torneio perfeito (8 filmes) deve ter 8 fighters e 0 byes", () => {
      const movies = makeMovies([1, 2, 3, 4, 5, 6, 7, 8]);
      const { fighters, byes, bracketSize } = setupTournament(movies, "random", 8);
      expect(bracketSize).toBe(8);
      expect(fighters).toHaveLength(8);
      expect(byes).toHaveLength(0);
   });


   it("[M7-A/B] 5 filmes → bracketSize=8, 2 fighters, 3 byes", () => {
      const movies = makeMovies([1, 2, 3, 4, 5]);
      const { fighters, byes, bracketSize } = setupTournament(movies, "random", 5);
      expect(bracketSize).toBe(8);
      expect(fighters).toHaveLength(2);
      expect(byes).toHaveLength(3);
   });

   it("[M7-A/B] 3 filmes → bracketSize=4, 2 fighters, 1 bye", () => {
      const movies = makeMovies([1, 2, 3]);
      const { fighters, byes, bracketSize } = setupTournament(movies, "random", 3);
      expect(bracketSize).toBe(4);
      expect(fighters).toHaveLength(2);
      expect(byes).toHaveLength(1);
   });

   it("[M7-C/D] fighters e byes não devem conter os mesmos filmes", () => {
      const movies = makeMovies([1, 2, 3, 4, 5]);
      const { fighters, byes } = setupTournament(movies, "random", 5);
      const fighterIds = new Set(fighters.map((m) => m.id));
      const byeIds = byes.map((m) => m.id);
      expect(byeIds.every((id) => !fighterIds.has(id))).toBe(true);
   });

   it("[M7-C/D] fighters + byes devem cobrir todos os participantes sem perda", () => {
      const movies = makeMovies([1, 2, 3, 4, 5]);
      const { fighters, byes } = setupTournament(movies, "random", 5);
      expect(fighters.length + byes.length).toBe(5);
   });

   it("fighters + byes deve igualar o número de participantes selecionados", () => {
      for (const qty of [2, 3, 4, 5, 6, 7, 8]) {
         const movies = makeMovies(Array.from({ length: qty }, (_, i) => i + 1));
         const { fighters, byes } = setupTournament(movies, "random", qty);
         expect(fighters.length + byes.length).toBe(qty);
      }
   });
});

describe("setupTournament — embaralhamento final", () => {
   it("[M8-A/C] critérios não-random devem produzir fighters e byes corretos", () => {
      const movies = makeMovies([1, 2, 3, 4, 5]);
      for (const criteria of ["top_rated", "worst_rated", "recent"] as const) {
         const { fighters, byes } = setupTournament(movies, criteria, 5);
         expect(fighters.length + byes.length).toBe(5);
         expect(fighters).toHaveLength(2);
         expect(byes).toHaveLength(3);
      }
   });

   it("[M8-B] critério random deve produzir fighters e byes corretos", () => {
      const movies = makeMovies([1, 2, 3, 4, 5]);
      const { fighters, byes } = setupTournament(movies, "random", 5);
      expect(fighters.length + byes.length).toBe(5);
   });
   
   it("[M8-A] após embaralhamento, byes e fighters são subconjuntos dos participantes", () => {
      const movies = makeMovies([1, 3, 5, 7, 9]);
      const { fighters, byes } = setupTournament(movies, "top_rated", 4);
      const participantIds = new Set(allParticipants({ fighters, byes }).map((m) => m.id));
      const allIds = new Set(movies.map((m) => m.id));
      participantIds.forEach((id) => expect(allIds.has(id)).toBe(true));
   });
});