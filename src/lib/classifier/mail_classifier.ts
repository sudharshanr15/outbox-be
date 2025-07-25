import natural from "natural"
import fs from "fs"
import csvParser from "csv-parser";
import path from "path";

let classifier: natural.BayesClassifier | null = null;

const training_data_path = path.resolve(__dirname, "emails.csv");
const weights_path = path.resolve(__dirname, "classifier.json");

export async function train(): Promise<void> {
  return new Promise((resolve, reject) => {
    const newClassifier = new natural.BayesClassifier();

    fs.createReadStream(training_data_path)
      .pipe(csvParser())
      .on("data", (row) => {
        newClassifier.addDocument(row.email_text, row.label);
      })
      .on("end", () => {
        newClassifier.train();
        newClassifier.save(weights_path, (err) => {
          if (err) {
            console.error("Error saving classifier:", err);
            reject(err);
          } else {
            classifier = newClassifier;
            console.log("Classifier trained and saved.");
            resolve();
          }
        });
      });
  });
}

export async function loadClassifier(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    natural.BayesClassifier.load(weights_path, null, (err, loaded) => {
      if (err || !loaded) {
        console.error("Unable to load classifier:", err);
        return reject(err);
      }
      classifier = loaded;
      console.log("Classifier loaded");
      resolve(true);
    });
  });
}

export async function classifyEmail(title: string): Promise<string | null> {
  if(classifier == null)
    await loadClassifier()

  return new Promise((res, rej) => {
      if (classifier == null) rej();
      res(classifier!.classify(title));
  })
}
