const formatMemoryUsage = (data) => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`

const memoryData = process.memoryUsage()

const memoryUsage = {
                rss: `${formatMemoryUsage(memoryData.rss)} -> Resident Set Size - total memory allocated for the process execution`,
                heapTotal: `${formatMemoryUsage(memoryData.heapTotal)} -> total size of the allocated heap`,
                heapUsed: `${formatMemoryUsage(memoryData.heapUsed)} -> actual memory used during the execution`,
                external: `${formatMemoryUsage(memoryData.external)} -> V8 external memory`,
}

console.log(memoryUsage)
/*
{
    "rss": "177.54 MB -> Resident Set Size - total memory allocated for the process execution",
    "heapTotal": "102.3 MB -> total size of the allocated heap",
    "heapUsed": "94.3 MB -> actual memory used during the execution",
    "external": "3.03 MB -> V8 external memory"
}
*/