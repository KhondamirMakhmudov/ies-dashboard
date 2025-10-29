// employee page
export const genderOptions = [
  { value: "мужской", label: "Мужской" },
  { value: "женский", label: "Женский" },
];
export const educationLevelOptions = [
  { value: "школа", label: "Школа" },
  { value: "среднее", label: "Среднее" },
  { value: "среднее специальноe", label: "Среднее специальноe" },
  { value: "военное училище", label: "Военное училище" },
  { value: "высшее", label: "Высшее" },
  { value: "бакалавр", label: "бакалавр" },
  { value: "специалитет", label: "Специалитет" },
  { value: "магистр", label: "Магистр" },
  { value: "кандидат наук", label: "Кандидат наук" },
  { value: "доктор наук", label: "Доктор наук" },
];

export const razryadOptions = Array.from({ length: 16 }, (_, i) => {
  const lvl = i + 1;
  return {
    value: lvl,
    label: `${lvl}-разряд`,
  };
});
