// import natural from "natural"
// import fs from "fs"
// import csvParser from "csv-parser";
// import path from "path";

// let classifier: natural.BayesClassifier | undefined = new natural.BayesClassifier();

// const training_data_path = path.resolve(__dirname, "emails.csv");
// const weights_path = path.resolve(__dirname, "classifier.json")

// export async function train(){
//     fs.createReadStream(training_data_path)
//     .pipe(csvParser())
//     .on("data", (row) => {
//         classifier!.addDocument(row.email_text, row.label);
//     })
//     .on("end", () => {
//         classifier!.save(weights_path, (err) => {
//             if (err) console.error("Error:", err);
//             else console.log("Classifier trained and saved.");
//         });
//     });
// }

// export async function loadClassifier(){
//     return new Promise((res, rej)=>{
//         natural.BayesClassifier.load(weights_path, null, (err, classifier) => {
//             if(err){
//                 console.log("Unable to load classifier")
//             }else{
//                 classifier!.classify("hello")
//                 res(classifier)
//             }
//         })
//     })
// }

// export async function classifyEmail(title: string){
//   if (!classifier) throw new Error("Classifier not loaded");
//   return classifier.classify(title);
// }

import natural from "natural"
import fs from "fs"
import csvParser from "csv-parser";
import path from "path";

let classifier: natural.BayesClassifier | null = null;

const training_data_path = path.resolve(__dirname, "emails.csv");
const weights_path = path.resolve(__dirname, "classifier.json");

// ✅ TRAIN FUNCTION — waits for training to complete
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

export async function loadClassifier(): Promise<void> {
  return new Promise((resolve, reject) => {
    natural.BayesClassifier.load(weights_path, null, (err, loaded) => {
      if (err || !loaded) {
        console.error("Unable to load classifier:", err);
        return reject(err);
      }
      classifier = loaded;
      console.log("Classifier loaded");
      resolve();
    });
  });
}

export function classifyEmail(title: string): string {
  if (!classifier) throw new Error("Classifier not loaded");
  return classifier.classify(title);
}
