export async function getHi() {
    const res = await fetch("http://localhost:8080/api/hi");

    if (!res.ok) {
        throw new Error("API error");
    }

    return res.json();
}