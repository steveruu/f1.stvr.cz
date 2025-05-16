
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDriverStandings } from "@/services/f1Service";
import { SkeletonCard } from "./SkeletonCard";

export function DriverStandingsTable() {
  const { standings, loading, error } = useDriverStandings();

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded bg-red-900/20 border border-red-900 text-center">
        <p className="text-red-400">{error}</p>
        <p className="text-gray-400 text-sm mt-1">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-800 overflow-hidden">
      <Table>
        <TableHeader className="bg-f1-gray">
          <TableRow className="hover:bg-transparent border-gray-800">
            <TableHead className="text-gray-400 w-16 text-center">Pos</TableHead>
            <TableHead className="text-gray-400">Driver</TableHead>
            <TableHead className="text-gray-400">Nationality</TableHead>
            <TableHead className="text-gray-400">Constructor</TableHead>
            <TableHead className="text-gray-400 text-right">Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {standings.map((standing) => (
            <TableRow 
              key={standing.position} 
              className="border-gray-800 bg-f1-dark hover:bg-f1-gray/50"
            >
              <TableCell className="font-medium text-center">{standing.position}</TableCell>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-xs px-1.5 py-0.5 rounded bg-gray-700/50 font-mono`}>
                    {standing.Driver.code}
                  </span>
                  {standing.Driver.givenName} <span className="font-bold">{standing.Driver.familyName}</span>
                </div>
              </TableCell>
              <TableCell>{standing.Driver.nationality}</TableCell>
              <TableCell>{standing.Constructors[0]?.name || 'N/A'}</TableCell>
              <TableCell className="text-right font-bold">
                <span className={parseInt(standing.position) === 1 ? "text-f1-red" : ""}>{standing.points}</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
