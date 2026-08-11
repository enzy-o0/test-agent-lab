export function kebabCaseToTitleCase(colorName: string) {
    const colorWithSpaces = colorName.replaceAll('-', ' ');
    const colorWithCaps = colorWithSpaces.replace(/\b([a-z])/g, (match) => match.toUpperCase());
    // 단어 경계에 있어야하고 소문자 입력, 괄호를 사용하여 어떤 소문자인지 캡쳐

    return colorWithCaps;
}
