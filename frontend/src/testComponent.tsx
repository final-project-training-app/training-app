import { useQuery } from "@tanstack/react-query";
import { getHi } from "./api";

export function HiPage() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["hi"],
        queryFn: getHi,
    });

    if (isLoading) return <p>Laddar...</p>;
    if (error) return <p>Fel vid hämtning</p>;

    return (
        <div>
            <h1>{data.message}</h1>
        </div>
    );
}