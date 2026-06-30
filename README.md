# ADHD Focus Reader 🧠✨

Inteligentna wtyczka do przeglądarki Google Chrome, zaprojektowana z myślą o osobach z ADHD i zaburzeniami koncentracji. Narzędzie łączy ułatwienia wizualne z modułem dźwiękowym, tworząc optymalne środowisko do czytania i przyswajania długich tekstów w Internecie.

## 🌟 Główne funkcje

- **Inteligentne pogrubianie tekstu (Bionic Reading)**  
  Wtyczka automatycznie analizuje bloki tekstowe na stronach i pogrubia wybrane litery w wyrazach (np. pierwsze litery). Pomaga to "prowadzić" wzrok po tekście i pozwala mózgowi szybciej autouzupełniać słowa, zmniejszając zmęczenie. Masz możliwość wyboru w menu, czy pogrubiane mają być litery na początku, na końcu, czy po obu stronach słowa.
  
- **Filtrowanie szumu wizualnego**  
  Skrypt celowo ignoruje duże nagłówki (H1-H6), przyciski i linki nawigacyjne. Modyfikuje tylko ten tekst, który faktycznie wymaga skupienia (np. akapity i długie artykuły), zapobiegając w ten sposób "przebodźcowaniu".

- **Muzyka tła oparta na kontekście (Offline AI)**  
  Wtyczka posiada wbudowany analizator słów kluczowych. Błyskawicznie skanuje czytany tekst w poszukiwaniu kontekstu tematycznego i na jego podstawie dobiera odpowiedni, zapętlony dźwięk w tle (np. "klimat fantasy" dla tekstów fabularnych lub "szum fal/lo-fi" dla artykułów naukowych). Działa to całkowicie offline, bez wysyłania Twoich danych na zewnętrzne serwery.

## 🛠️ Instalacja dla testerów

Aby przetestować wtyczkę lokalnie w swojej przeglądarce:

1. Pobierz to repozytorium na swój komputer.
2. Otwórz przeglądarkę Google Chrome i przejdź pod adres: `chrome://extensions/`
3. W prawym górnym rogu włącz **Tryb programisty** (Developer mode).
4. W lewym górnym rogu kliknij **Załaduj rozpakowane** (Load unpacked).
5. Wybierz folder z wtyczką. Gotowe! (Zalecamy przypięcie ikony puzzla na pasku).

## ⚙️ Technologie
- Vanilla JavaScript, HTML5, CSS3
- Google Chrome Extension API (Manifest V3)
- Chrome Offscreen API (do odtwarzania ciągłego dźwięku w tle)

---
*Projekt stworzony z myślą o lepszym i spokojniejszym przyswajaniu wiedzy w cyfrowym świecie.*
