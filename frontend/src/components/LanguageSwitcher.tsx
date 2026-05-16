import i18n from "i18next";

const changeLanguage = (lng: string) => {
  i18n.changeLanguage(lng);
};

export default function LanguageSwitcher() {
  return (
    <select onChange={(e) => changeLanguage(e.target.value)} defaultValue="en">
      <option value="en">English</option>
      <option value="sv">Svenska</option>
    </select>
  );
}