import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useConstructorStandings } from "@/services/f1Service";
import { SkeletonCard } from "./SkeletonCard";
import { TrophyIcon, CarIcon } from "lucide-react";

export function ConstructorStandingsTable() {
  const { standings, loading, error } = useConstructorStandings();

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-red-900/20 border border-red-900 text-center">
        <p className="text-red-400">{error}</p>
        <p className="text-gray-400 text-sm mt-1">Zkuste to prosím později</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-800 overflow-hidden bg-black/20 backdrop-blur-sm">
      <Table>
        <TableHeader className="bg-black/40">
          <TableRow className="hover:bg-transparent border-gray-800">
            <TableHead className="text-gray-400 w-16 text-center">Poz</TableHead>
            <TableHead className="text-gray-400">Tým</TableHead>
            <TableHead className="text-gray-400 hidden md:table-cell">Národnost</TableHead>
            <TableHead className="text-gray-400 text-right">Body</TableHead>
            <TableHead className="text-gray-400 text-right">Vítězství</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {standings.map((standing) => (
            <TableRow
              key={standing.position}
              className="border-gray-800 hover:bg-white/5"
            >
              <TableCell className="font-medium text-center relative">
                {parseInt(standing.position) <= 3 ? (
                  <div className={`absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 opacity-10 ${parseInt(standing.position) === 1 ? 'text-yellow-500' :
                    parseInt(standing.position) === 2 ? 'text-gray-400' : 'text-amber-700'
                    }`}>
                    <TrophyIcon className="h-8 w-8" />
                  </div>
                ) : null}
                <span className={`relative z-10 font-bold ${parseInt(standing.position) === 1 ? 'text-yellow-500' :
                  parseInt(standing.position) === 2 ? 'text-gray-400' :
                    parseInt(standing.position) === 3 ? 'text-amber-700' : ''
                  }`}>{standing.position}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{standing.Constructor.name}</span>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">{standing.Constructor.nationality}</TableCell>
              <TableCell className="text-right font-bold">
                <span className={parseInt(standing.position) === 1 ? "text-f1-red" : ""}>{standing.points}</span>
              </TableCell>
              <TableCell className="text-right">{standing.wins}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
