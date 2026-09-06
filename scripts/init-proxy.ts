import { copyFileSync, appendFileSync, readFileSync } from "fs";

const dir = new URL(".", import.meta.url).pathname;
const config = `${dir}proxychains.conf`;
const template = `${dir}proxychains.template.conf`;

const content = readFileSync("/etc/resolv.conf", "utf-8");
const match = content.match(/nameserver\s+(\S+)/);
const hostIp = match?.[1] ?? "127.0.0.1";

console.log(`proxying to ${hostIp}`);

copyFileSync(template, config);
appendFileSync(config, `http ${hostIp} 7890\n`);
