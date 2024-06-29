document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get(['question'], function(result) {
        if (result.question) {
            document.getElementById('question').innerHTML = `
        <a href="https://leetcode.com/problems/${result.question.titleSlug}" target="_blank">
          ${result.question.title}
        </a><br>
        Difficulty: ${result.question.difficulty}<br>
        Likes: ${result.question.likes}<br>
        Dislikes: ${result.question.dislikes}<br>
        Percentage Likes: ${result.question.percentageLikes}%
      `;
        } else {
            document.getElementById('question').textContent = 'No question available.';
        }
    });
});
