import fs from "fs";
import path from "path";

const iconsDir = "app/icons";
const outputFile = "app/icons/index.tsx";

const files = fs.readdirSync(iconsDir).filter((f) => f.endsWith(".svg"));

const components: string[] = [];
const aliases: string[] = [];
const usedAliases = new Set<string>();

const aliasMap: Record<string, string[]> = {
  "delete.svg": ["DeleteIcon"],
  "bot.svg": ["BotIcon"],
  "github.svg": ["GithubIcon"],
  "reload.svg": ["ResetIcon"],
  "share.svg": ["ShareIcon"],
  "send-white.svg": ["SendWhiteIcon"],
  "rename.svg": ["RenameIcon", "EditIcon"],
  "export.svg": ["ExportIcon"],
  "return.svg": ["ReturnIcon"],
  "copy.svg": ["CopyIcon"],
  "three-dots.svg": ["LoadingIcon"],
  "loading.svg": ["LoadingButtonIcon"],
  "prompt.svg": ["PromptIcon"],
  "max.svg": ["MaxIcon"],
  "min.svg": ["MinIcon"],
  "break.svg": ["BreakIcon"],
  "clear.svg": ["ClearIcon", "DeleteIcon"],
  "confirm.svg": ["ConfirmIcon"],
  "image.svg": ["ImageIcon"],
  "brain.svg": ["BrainIcon"],
  "bottom.svg": ["BottomIcon"],
  "pause.svg": ["StopIcon"],
  "robot.svg": ["RobotIcon"],
  "mlc.svg": ["MlcIcon"],
  "close.svg": ["CloseIcon"],
  "eye.svg": ["EyeIcon"],
  "eye-off.svg": ["EyeOffIcon"],
  "down.svg": ["DownIcon"],
  "cancel.svg": ["CancelIcon"],
  "meta.svg": ["MetaIcon"],
  "microsoft.svg": ["MicrosoftIcon"],
  "mistral.svg": ["MistralIcon"],
  "google.svg": ["GoogleIcon"],
  "stablelm.svg": ["StablelmIcon"],
  "deepseek.svg": ["DeepSeekIcon"],
  "download.svg": ["DownloadIcon"],
  "add.svg": ["AddIcon"],
  "edit.svg": ["EditIcon"],
  "connection.svg": ["ConnectIcon"],
  "gear.svg": ["SettingsIcon"],
  "internet.svg": ["InternetIcon"],
  "chat.svg": ["TemplateIcon"],
  "drag.svg": ["DragIcon"],
  "light.svg": ["LightIcon"],
  "dark.svg": ["DarkIcon"],
  "auto.svg": ["AutoIcon"],
  "upload.svg": ["UploadIcon"],
};

for (const file of files) {
  const name = file.replace(".svg", "");
  const pascalName = name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  let svgContent = fs.readFileSync(path.join(iconsDir, file), "utf-8");

  svgContent = svgContent.replace(/<\?xml[^?]*\?>/g, "").trim();
  svgContent = svgContent.replace(/<!--[\s\S]*?-->/g, "").trim();
  svgContent = svgContent.replace(/xlink:href=/g, "href=");
  svgContent = svgContent.replace(/\s*xmlns:xlink="[^"]*"/g, "");
  svgContent = svgContent.replace(/\s*xmlns:sketch="[^"]*"/g, "");
  svgContent = svgContent.replace(/\s*xml:space="[^"]*"/g, "");
  svgContent = svgContent.replace(/\s*sketch:type="[^"]*"/g, "");

  const escapedSvg = svgContent
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");

  components.push(`export const ${pascalName}: React.FC<React.HTMLAttributes<HTMLSpanElement>> = (props) => {
  const { children, ...rest } = props;
  return (
    <span {...rest} dangerouslySetInnerHTML={{ __html: \`${escapedSvg}\` }} />
  );
};`);

  const aliasesForFile = aliasMap[file] || [];
  for (const alias of aliasesForFile) {
    if (!usedAliases.has(alias)) {
      aliases.push(`export { ${pascalName} as ${alias} };`);
      usedAliases.add(alias);
    }
  }
}

fs.writeFileSync(
  outputFile,
  `import React from "react";

${components.join("\n\n")}

${aliases.join("\n")}
`,
);
console.log(
  `Generated ${components.length} icon components and ${aliases.length} aliases in ${outputFile}`,
);
