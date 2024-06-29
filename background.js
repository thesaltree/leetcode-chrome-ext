chrome.runtime.onInstalled.addListener(() => {
    // Calculate delay until the next 11 AM
    const now = new Date();
    const next11AM = new Date();
    next11AM.setHours(14, 15, 0, 0); // Set time to 11:00:00
    if (now > next11AM) {
        next11AM.setDate(next11AM.getDate() + 1); // Move to the next day if 11 AM has passed
    }
    const delay = next11AM.getTime() - now.getTime(); // Calculate delay in milliseconds

    chrome.alarms.create('fetchQuestion', { when: Date.now() + delay, periodInMinutes: 1440 });
    fetchAndStoreQuestion();
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'fetchQuestion') {
        fetchAndStoreQuestion();
    }
});

function fetchAndStoreQuestion() {
    const fetchRandomQuestion = async () => {
        const graphqlEndpoint = 'https://leetcode.com/graphql/';
        const randomQuestionQuery = `
      query randomQuestion($categorySlug: String, $filters: QuestionListFilterInput) {
        randomQuestion(categorySlug: $categorySlug, filters: $filters) {
          titleSlug
        }
      }
    `;
        const questionDetailsQuery = `
      query questionData($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          titleSlug
          title
          likes
          dislikes
          difficulty
          isPaidOnly
        }
      }
    `;

        try {
            const randomQuestionResponse = await fetch(graphqlEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: randomQuestionQuery,
                    variables: { categorySlug: "", filters: {} }
                })
            });
            const randomQuestionData = await randomQuestionResponse.json();
            const titleSlug = randomQuestionData.data.randomQuestion.titleSlug;

            const questionDetailsResponse = await fetch(graphqlEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: questionDetailsQuery,
                    variables: { titleSlug }
                })
            });
            const questionDetailsData = await questionDetailsResponse.json();
            const question = questionDetailsData.data.question;

            question.percentageLikes = (question.likes * 100) / (question.likes + question.dislikes);

            chrome.storage.local.set({ question });
        } catch (error) {
            console.error('Error fetching LeetCode question:', error);
        }
    };

    fetchRandomQuestion();
}
