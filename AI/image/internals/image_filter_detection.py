import cv2
import numpy as np
import urllib.error
from scipy.stats import norm

from internals.image_downloader import downloader


class ImageAnalyzer:
    def __init__(self):
        self.contrast_mean = 60
        self.edge_strength_mean = 550
        self.laplacian_var_mean = 350

    def filter_detect(self, urls: list) -> list:
        results = []
        for url in urls:
            try:
                contrast, edge_strength, laplacian_var = self.calculate_filter_value(url)
            except urllib.error.HTTPError:
                results.append([None, None, None])
                continue

            contrast_evaluation = self.evaluate(self.contrast_mean, contrast)
            edge_strength_evaluation = self.evaluate(self.edge_strength_mean, edge_strength)
            laplacian_var_evaluation = self.evaluate(self.laplacian_var_mean, laplacian_var)
            results.append([contrast_evaluation, edge_strength_evaluation, laplacian_var_evaluation])
        return results

    def evaluate(self, mean: int, value: float) -> int:
        std_dev = mean / 4
        percentile = norm.cdf(value, mean, std_dev) * 100

        if percentile < 11:
            return 0
        elif percentile < 40:
            return 1
        elif percentile < 60:
            return 2
        elif percentile < 89:
            return 3
        else:
            return 4

    def calculate_filter_value(self, url: str) -> tuple:
        image = downloader.load_matrix_from_url(url)
        contrast = self._calculate_contrast(image)
        edge_strength = self._calculate_edge_strength(image)
        laplacian_var = self._get_laplacian_var(image)
        return contrast, edge_strength, laplacian_var

    def _calculate_contrast(self, image: np.ndarray) -> float:
        # 이미지의 표준 편차를 계산하여 contrast로 사용
        return np.std(image)

    def _calculate_edge_strength(self, image: np.ndarray) -> float:
        sobelx = cv2.Sobel(image, cv2.CV_64F, 1, 0, ksize=5)
        sobely = cv2.Sobel(image, cv2.CV_64F, 0, 1, ksize=5)
        sobel = np.sqrt(sobelx**2 + sobely**2)
        return np.mean(sobel)

    def _get_laplacian_var(self, gray_image: np.ndarray) -> float:
        laplacian = cv2.Laplacian(gray_image, cv2.CV_64F)
        return laplacian.var()


imageAnalyzer = ImageAnalyzer()
